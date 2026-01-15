import { EraserBrush } from '@erase2d/fabric';
import * as fabric from 'fabric';
import { useCallback, useEffect, useRef } from 'react';
import { Canvas } from '../src/Canvas';
import { useIsTransparentWorker } from '../src/useIsTransparentWorker';
import { useStore } from './Store';

export default function FabricPage() {
  const { tool, removeFullyErased, setActiveObject } = useStore();
  const ref = useRef<fabric.Canvas>(null);
  const isTransparent = useIsTransparentWorker();

  const onLoad = useCallback(
    (canvas: fabric.Canvas) => {
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const eraser = (canvas.freeDrawingBrush = new EraserBrush(canvas));
      eraser.width = 30;

      const group = 'deep';
      const rect = new fabric.Rect({
        width: 500,
        height: 200,
        fill: 'blue',
        erasable: true,
        clipPath: new fabric.Circle({ radius: 50, inverted: true }),
      });
      const circle = new fabric.Circle({
        radius: 50,
        fill: 'magenta',
        erasable: true,
      });
      const objects = [
        new fabric.Rect({
          width: 100,
          height: 100,
          fill: 'blue',
          erasable: true,
        }),
        new fabric.Rect({
          width: 100,
          height: 100,
          left: 50,
          top: 50,
          fill: 'magenta',
          erasable: false,
        }),
        new fabric.Circle({
          radius: 200,
          /*opacity: 0.8,*/ fill: 'rgba(255,255,0,0.4)',
          erasable: false,
        }),
        new fabric.Rect({
          width: 100,
          height: 100,
          left: 100,
          top: 100,
          fill: 'red',
          erasable: false,
          opacity: 0.8,
        }),
        new fabric.Rect({
          width: 100,
          height: 100,
          left: 0,
          top: 100,
          fill: 'red',
          erasable: false,
        }),
        new fabric.Circle({
          radius: 50,
          left: 100,
          top: 100,
          fill: 'cyan',
          erasable: true,
          shadow: new fabric.Shadow({
            offsetX: 20,
            offsetY: 20,
            color: 'rgba(255,0,0,0.3)',
          }),
        }),
        new fabric.Group(
          [
            new fabric.Circle({
              radius: 50,
              left: 0,
              top: 100,
              fill: 'cyan',
              clipPath: new fabric.Circle({
                radius: 50,
                left: -25,
                top: -25,
                originX: 'center',
                originY: 'center',
              }),
            }),
          ],
          {
            erasable: !!group,
            subTargetCheck: true,
            interactive: true,
            clipPath: new fabric.Circle({
              radius: 50,
              left: 25,
              top: 25,
              originX: 'center',
              originY: 'center',
            }),
          }
        ),
      ];

      canvas.add(
        rect,
        ...(!!group
          ? [
              new fabric.Group(objects, {
                erasable: group,
                subTargetCheck: true,
                interactive: true,
              }),
            ]
          : objects),
        circle
      );

      const animate = (toState: number) => {
        rect.animate(
          { scaleX: Math.max(toState, 0.1) * 2 },
          {
            onChange: () => canvas.renderAll(),
            onComplete: () => animate(Number(!toState)),
            duration: 1000,
            easing: toState
              ? fabric.util.ease.easeInOutQuad
              : fabric.util.ease.easeInOutSine,
          }
        );
      };
      animate(1);
    },
    [ref]
  );

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) {
      return;
    }
    const brush = (canvas.freeDrawingBrush =
      tool === 'draw'
        ? new fabric.PencilBrush(canvas)
        : new EraserBrush(canvas));
    brush.width = 30;
    brush instanceof EraserBrush && (brush.inverted = tool === 'undo');
    canvas.isDrawingMode = tool !== 'select';
    return canvas.on(
      'path:created',
      ({ path }) => tool === 'draw' && (path.erasable = true)
    );
  }, [ref, tool]);

  useEffect(() => {
    const canvas = ref.current;
    if (
      !canvas ||
      !removeFullyErased ||
      (tool !== 'erase' && tool !== 'undo') ||
      !(canvas.freeDrawingBrush instanceof EraserBrush)
    ) {
      return;
    }
    const eraser = canvas.freeDrawingBrush;
    return eraser.on('end', async (e) => {
      e.preventDefault();
      const res = await eraser.commit(e.detail);
      console.log(res);
      const transparent = await Promise.all(
        e.detail.targets.map(
          async (target) => [target, await isTransparent(target)] as const
        )
      );
      const fullyErased = transparent
        .filter(([, transparent]) => transparent)
        .map(([object]) => object);
      fullyErased.forEach((object) => (object.parent || canvas).remove(object));
      canvas.requestRenderAll();
      fullyErased.length &&
        console.log('Removed the following fully erased objects', fullyErased);
    });
  }, [ref, tool, removeFullyErased]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) {
      return;
    }
    const disposers = (
      ['selection:created', 'selection:updated', 'selection:cleared'] as const
    ).map((ev) =>
      canvas.on(ev, () => setActiveObject(canvas.getActiveObject()))
    );
    return () => disposers.forEach((d) => d());
  }, [ref, tool]);

  return <Canvas ref={ref} onLoad={onLoad} />;
}
