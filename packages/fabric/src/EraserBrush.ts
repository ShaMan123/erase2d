import * as fabric from 'fabric';
import { FabricObject, Group, Path } from 'fabric';
import { ClippingGroup } from './ClippingGroup';
import { draw } from './ErasingEffect';

export type EventDetailMap = {
  start: fabric.TEvent<fabric.TPointerEvent>;
  move: fabric.TEvent<fabric.TPointerEvent>;
  end: {
    path: fabric.Path;
    targets: fabric.FabricObject[];
  };
  redraw: { type: 'start' | 'render' };
  cancel: never;
};

export type ErasingEventType = keyof EventDetailMap;

export type ErasingEvent<T extends ErasingEventType> = CustomEvent<
  EventDetailMap[T]
>;

function walk(objects: FabricObject[], path: Path): FabricObject[] {
  return objects.flatMap((object) => {
    if (!object.erasable || !object.intersectsWithObject(path)) {
      return [];
    } else if (object instanceof Group && object.erasable === 'deep') {
      return walk(object.getObjects(), path);
    } else {
      return [object];
    }
  });
}

const assertClippingGroup = (object: fabric.FabricObject) => {
  const curr = object.clipPath;

  if (curr instanceof ClippingGroup) {
    return curr;
  }

  const strokeWidth = object.strokeWidth;
  const strokeWidthFactor = new fabric.Point(strokeWidth, strokeWidth);
  const strokeVector = object.strokeUniform
    ? strokeWidthFactor.divide(object.getObjectScaling())
    : strokeWidthFactor;

  const next = new ClippingGroup([], {
    width: object.width + strokeVector.x,
    height: object.height + strokeVector.y,
  });

  if (curr) {
    const { x, y } = curr.translateToOriginPoint(
      new fabric.Point(),
      curr.originX,
      curr.originY
    );
    curr.originX = curr.originY = 'center';
    fabric.util.sendObjectToPlane(
      curr,
      undefined,
      fabric.util.createTranslateMatrix(x, y)
    );
    next.add(curr as FabricObject);
  }

  return (object.clipPath = next);
};

export function commitErasing(
  object: fabric.FabricObject,
  sourceInObjectPlane: fabric.Path
) {
  const clipPath = assertClippingGroup(object);
  clipPath.add(sourceInObjectPlane);
  clipPath.set('dirty', true);
  object.set('dirty', true);
}

export async function eraseObject(
  object: fabric.FabricObject,
  source: fabric.Path
) {
  const clone = await source.clone();
  fabric.util.sendObjectToPlane(clone, undefined, object.calcTransformMatrix());
  commitErasing(object, clone);
  return clone;
}

export async function eraseCanvasDrawable(
  object: fabric.FabricObject,
  vpt: fabric.TMat2D | undefined,
  source: fabric.Path
) {
  const clone = await source.clone();
  const d =
    vpt &&
    object.translateToOriginPoint(
      new fabric.Point(),
      object.originX,
      object.originY
    );
  fabric.util.sendObjectToPlane(
    clone,
    undefined,
    d
      ? fabric.util.multiplyTransformMatrixArray([
          [1, 0, 0, 1, d.x, d.y],
          // apply vpt from center of drawable
          vpt,
          [1, 0, 0, 1, -d.x, -d.y],
          object.calcTransformMatrix(),
        ])
      : object.calcTransformMatrix()
  );
  commitErasing(object, clone);
  return clone;
}

const setCanvasDimensions = (
  el: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  { width, height }: fabric.TSize,
  retinaScaling = 1
) => {
  el.width = width;
  el.height = height;
  if (retinaScaling > 1) {
    el.setAttribute('width', (width * retinaScaling).toString());
    el.setAttribute('height', (height * retinaScaling).toString());
    ctx.scale(retinaScaling, retinaScaling);
  }
};

/**
 * Supports **selective** erasing: only erasable objects are affected by the eraser brush.
 *
 * Supports **{@link inverted}** erasing: the brush can "undo" erasing.
 *
 * Supports **alpha** erasing: setting the alpha channel of the `color` property controls the eraser intensity.
 *
 * In order to support selective erasing, the brush clips the entire canvas and
 * masks all non-erasable objects over the erased path, see {@link draw}.
 *
 * If **{@link inverted}** draws all objects, erasable objects without their eraser, over the erased path.
 * This achieves the desired effect of seeming to erase or undo erasing on erasable objects only.
 *
 * After erasing is done the `end` event {@link ErasingEndEvent} is fired, after which erasing will be committed to the tree.
 * @example
 * canvas = new Canvas();
 * const eraser = new EraserBrush(canvas);
 * canvas.freeDrawingBrush = eraser;
 * canvas.isDrawingMode = true;
 * eraser.on('start', (e) => {
 *    console.log('started erasing');
 *    // prevent erasing
 *    e.preventDefault();
 * });
 * eraser.on('end', (e) => {
 *    const { targets: erasedTargets, path } = e.detail;
 *    e.preventDefault(); // prevent erasing being committed to the tree
 *    eraser.commit({ targets: erasedTargets, path }); // commit manually since default was prevented
 * });
 *
 * In case of performance issues trace {@link drawEffect} calls and consider preventing it from executing
 * @example
 * const eraser = new EraserBrush(canvas);
 * eraser.on('redraw', (e) => {
 *    // prevent effect redraw on pointer down (e.g. useful if canvas didn't change)
 *    e.detail.type === 'start' && e.preventDefault());
 *    // prevent effect redraw after canvas has rendered (effect will become stale)
 *    e.detail.type === 'render' && e.preventDefault());
 * });
 */
export class EraserBrush extends fabric.PencilBrush {
  /**
   * When set to `true` the brush will create a visual effect of undoing erasing
   */
  inverted = false;

  effectContext: CanvasRenderingContext2D;

  private eventEmitter: EventTarget;
  private active = false;
  private _disposer?: VoidFunction;

  constructor(canvas: fabric.Canvas) {
    super(canvas);
    const el = document.createElement('canvas');
    const ctx = el.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get context');
    }
    setCanvasDimensions(el, ctx, canvas, this.canvas.getRetinaScaling());
    this.effectContext = ctx;
    this.eventEmitter = new EventTarget();
  }

  /**
   * @returns disposer make sure to call it to avoid memory leaks
   */
  on<T extends ErasingEventType>(
    type: T,
    cb: (evt: ErasingEvent<T>) => any,
    options?: boolean | AddEventListenerOptions
  ) {
    this.eventEmitter.addEventListener(type, cb as EventListener, options);
    return () =>
      this.eventEmitter.removeEventListener(type, cb as EventListener, options);
  }

  drawEffect() {
    draw(
      this.effectContext,
      {
        opacity: new fabric.Color(this.color).getAlpha(),
        inverted: this.inverted,
      },
      { canvas: this.canvas }
    );
  }

  /**
   * @override
   */
  _setBrushStyles(ctx: CanvasRenderingContext2D = this.canvas.contextTop) {
    super._setBrushStyles(ctx);
    ctx.strokeStyle = 'black';
  }

  /**
   * @override strictly speaking the eraser needs a full render only if it has opacity set.
   * However since {@link PencilBrush} is designed for subclassing that is what we have to work with.
   */
  needsFullRender(): boolean {
    return true;
  }

  buildPath(path: Path2D, points: fabric.Point[]) {
    let [p1, p2] = points;

    //if we only have 2 points in the path and they are the same
    //it means that the user only clicked the canvas without moving the mouse
    //then we should be drawing a dot. A path isn't drawn between two identical dots
    //that's why we set them apart a bit
    if (points.length === 2 && p1.x === p2.x && p1.y === p2.y) {
      const width = this.width / 1000;
      p1.x -= width;
      p2.x += width;
    }
    path.moveTo(p1.x, p1.y);

    for (let i = 1; i < points.length; i++) {
      // we pick the point between pi + 1 & pi + 2 as the
      // end point and p1 as our control point.
      const midPoint = p1.midPointFrom(p2);
      path.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      p1 = points[i];
      p2 = points[i + 1];
    }
    // Draw last line as a straight line while
    // we wait for the next point to be able to calculate
    // the bezier control point
    path.lineTo(p1.x, p1.y);

    return path;
  }

  buildPathFill(strokeWidth: number) {
    const points = this['_points'] as fabric.Point[];
    const outline: fabric.Point[] = [points[0]];
    points
      .slice(1)
      .filter((p, i) => {
        const v = points[i].subtract(p);
        return fabric.util.magnitude(v) >= 1;
      })
      .forEach((p, i) => {
        const v = points[i].subtract(p);
        const n = fabric.util
          .getOrthonormalVector(v)
          .scalarMultiply(strokeWidth / 2);
        outline.unshift(p.subtract(n));
        outline.push(p.add(n));
      });
    const path = new Path2D();
    this.buildPath(path, outline);
    return path;
  }

  /**
   * @override erase
   */
  _render(ctx: CanvasRenderingContext2D = this.canvas.getTopContext()): void {
    this.canvas.clearContext(ctx);
    const path = this.buildPathFill(this.width);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.save();
    ctx.clip(path, 'nonzero');
    const { canvas: effectCanvas } = this.effectContext;
    const dpr = window.devicePixelRatio;
    ctx.drawImage(
      effectCanvas,
      0,
      0,
      Math.floor(effectCanvas.width * dpr),
      Math.floor(effectCanvas.height * dpr),
      0,
      0,
      effectCanvas.width,
      effectCanvas.height
    );
    ctx.restore();

    const base = this.canvas.getContext();
    base.save();
    base.globalCompositeOperation = 'destination-out';
    base.fill(path);
    base.restore();
  }

  /**
   * @override {@link drawEffect}
   */
  onMouseDown(
    pointer: fabric.Point,
    context: fabric.TEvent<fabric.TPointerEvent>
  ): void {
    if (
      !this.eventEmitter.dispatchEvent(
        new CustomEvent('start', { detail: context, cancelable: true })
      )
    ) {
      return;
    }

    this.active = true;

    this.eventEmitter.dispatchEvent(
      new CustomEvent('redraw', {
        detail: { type: 'start' },
        cancelable: true,
      })
    ) && this.drawEffect();

    // consider a different approach
    this._disposer = this.canvas.on('after:render', ({ ctx }) => {
      if (ctx !== this.canvas.getContext()) {
        return;
      }
      this.eventEmitter.dispatchEvent(
        new CustomEvent('redraw', {
          detail: { type: 'render' },
          cancelable: true,
        })
      ) && this.drawEffect();
      this._render();
    });

    super.onMouseDown(pointer, context);
  }

  /**
   * @override run if active
   */
  onMouseMove(
    pointer: fabric.Point,
    context: fabric.TEvent<fabric.TPointerEvent>
  ): void {
    this.active &&
      this.eventEmitter.dispatchEvent(
        new CustomEvent('move', { detail: context, cancelable: true })
      ) &&
      super.onMouseMove(pointer, context);
  }

  /**
   * @override run if active, dispose of {@link drawEffect} listener
   */
  onMouseUp(context: fabric.TEvent<fabric.TPointerEvent>): boolean {
    this.active && super.onMouseUp(context);
    this.active = false;
    this._disposer?.();
    delete this._disposer;
    return false;
  }

  /**
   * @override {@link fabric.PencilBrush} logic
   */
  convertPointsToSVGPath(points: fabric.Point[]): fabric.util.TSimplePathData {
    return super.convertPointsToSVGPath(
      this.decimate ? this.decimatePoints(points, this.decimate) : points
    );
  }

  /**
   * @override
   */
  createPath(pathData: fabric.util.TSimplePathData) {
    const path = super.createPath(pathData);
    path.set(
      this.inverted
        ? {
            globalCompositeOperation: 'source-over',
            stroke: 'white',
          }
        : {
            globalCompositeOperation: 'destination-out',
            stroke: 'black',
            opacity: new fabric.Color(this.color).getAlpha(),
          }
    );
    return path;
  }

  async commit({
    path,
    targets,
  }: EventDetailMap['end']): Promise<Map<fabric.FabricObject, fabric.Path>> {
    return new Map(
      await Promise.all([
        ...targets.map(async (object) => {
          return [object, await eraseObject(object, path)] as const;
        }),
        ...(
          [
            [
              this.canvas.backgroundImage,
              !this.canvas.backgroundVpt
                ? this.canvas.viewportTransform
                : undefined,
            ],
            [
              this.canvas.overlayImage,
              !this.canvas.overlayVpt
                ? this.canvas.viewportTransform
                : undefined,
            ],
          ] as const
        )
          .filter(([object]) => !!object?.erasable)
          .map(async ([object, vptFlag]) => {
            return [
              object,
              await eraseCanvasDrawable(object as FabricObject, vptFlag, path),
            ] as [fabric.FabricObject, fabric.Path];
          }),
      ])
    );
  }

  /**
   * @override handle events
   */
  _finalizeAndAddPath(): void {
    const points = this['_points'];

    if (points.length < 2) {
      this.eventEmitter.dispatchEvent(
        new CustomEvent('cancel', {
          cancelable: false,
        })
      );
      return;
    }

    const path = this.createPath(this.convertPointsToSVGPath(points));
    const targets = walk(this.canvas.getObjects(), path);

    this.eventEmitter.dispatchEvent(
      new CustomEvent('end', {
        detail: {
          path,
          targets,
        },
        cancelable: true,
      })
    ) && this.commit({ path, targets });

    this.canvas.clearContext(this.canvas.contextTop);
    this.canvas.requestRenderAll();

    this._resetShadow();
  }

  dispose() {
    const { canvas } = this.effectContext;
    // prompt GC
    canvas.width = canvas.height = 0;
    // release ref?
    // delete this.effectContext
  }
}
