import * as fabric from 'fabric';
import { FabricObject, Group, Path } from 'fabric';
import { erase } from '../../core/erase';
import { ClippingGroup } from './ClippingGroup';
import { draw } from './ErasingEffect';

export type ErasingEndEventDetail = {
  path: fabric.Path;
  targets: fabric.FabricObject[];
};

export type ErasingEndEvent = CustomEvent<ErasingEndEventDetail>;

type EventDetailMap = {
  start: VoidFunction;
  end: ErasingEndEventDetail;
};

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
  const next =
    curr instanceof ClippingGroup
      ? curr
      : new ClippingGroup([], {
          width: object.width,
          height: object.height,
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
 * eraser.on('start', () => {
 *    console.log('started erasing');
 * });
 * eraser.on('end', (e) => {
 *    const erasedTargets = e.detail.targets;
 *    e.preventDefault(); // prevent erasing being committed to the tree
 *    eraser.commit(e.detail); // commit manually since default was prevented
 * });
 *
 * In case of performance issues trace {@link drawEffect} calls.
 */
export class EraserBrush extends fabric.PencilBrush {
  /**
   * When set to `true` the brush will create a visual effect of undoing erasing
   */
  inverted = false;

  private effectContext: CanvasRenderingContext2D;
  private _disposer?: VoidFunction;

  private eventEmitter: EventTarget;

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
  on<T extends keyof EventDetailMap>(
    type: T,
    cb: (evt: CustomEvent<EventDetailMap[T]>) => any,
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
   * @override {@link drawEffect}
   */
  onMouseDown(
    pointer: fabric.Point,
    context: fabric.TEvent<fabric.TPointerEvent>
  ): void {
    this.drawEffect();
    // consider a different approach
    this._disposer = this.canvas.on('after:render', ({ ctx }) => {
      if (ctx !== this.canvas.getContext()) {
        return;
      }
      this.drawEffect();
      this._render();
    });
    this.eventEmitter.dispatchEvent(new CustomEvent('start'));
    super.onMouseDown(pointer, context);
  }

  /**
   * @override dispose of {@link drawEffect} listener
   */
  onMouseUp(context: fabric.TEvent<fabric.TPointerEvent>): boolean {
    super.onMouseUp(context);
    this._disposer?.();
    delete this._disposer;
    return false;
  }

  /**
   * @override strictly speaking the eraser needs a full render only if it has opacity set.
   * However since {@link PencilBrush} is designed for subclassing that is what we have to work with.
   */
  needsFullRender(): boolean {
    return true;
  }

  /**
   * @override erase
   */
  _render(ctx: CanvasRenderingContext2D = this.canvas.getTopContext()): void {
    super._render(ctx);
    erase(this.canvas.getContext(), ctx, this.effectContext);
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

  async commit({ path, targets }: ErasingEndEventDetail) {
    new Map(
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
          .filter(([object]) => object)
          .map(async ([object, vptFlag]) => {
            return [
              object,
              await eraseCanvasDrawable(object as FabricObject, vptFlag, path),
            ] as const;
          }),
      ])
    );
  }

  /**
   * @override fire `erasing:end`
   */
  _finalizeAndAddPath(): void {
    const points = this['_points'];

    if (points.length < 2) {
      return;
    }

    const path = this.createPath(
      this.convertPointsToSVGPath(
        this.decimate ? this.decimatePoints(points, this.decimate) : points
      )
    );
    const targets = walk(this.canvas.getObjects(), path);

    const ev = new CustomEvent('end', {
      detail: {
        path,
        targets,
      },
      cancelable: true,
    });
    this.eventEmitter.dispatchEvent(ev) && this.commit({ path, targets });

    this.canvas.clearContext(this.canvas.contextTop);
    this.canvas.requestRenderAll();

    this._resetShadow();
  }
}
