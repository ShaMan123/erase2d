import { EraserBrush } from '@erase2d/fabric';
import * as fabric from 'fabric';
import { NextPage } from 'next';
import { useCallback, useEffect, useRef } from 'react';
import { Canvas } from '../src/Canvas';
import { useIsTransparentWorker } from '../src/useIsTransparentWorker';
import { Tool } from '../src/tool';

const FabricPage: NextPage<{ tool: Tool }> = ({ tool }) => {
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
      eraser.on('end', async (e) => {
        e.preventDefault();
        await eraser.commit(e.detail);
        console.log(
          'isTransparent',
          await Promise.all(
            e.detail.targets.map(async (target) => [
              target,
              await isTransparent(target),
            ])
          )
        );
      });

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
      canvas.add(rect, circle);

      const animate = (toState: number) => {
        canvas.item(0).animate(
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
    [ref, isTransparent]
  );

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) {
      return;
    }
    (canvas.freeDrawingBrush as EraserBrush).inverted = tool === 'undo';
    canvas.isDrawingMode = tool !== 'default';
  }, [ref, tool]);

  return <Canvas ref={ref} onLoad={onLoad} />;
};

export default FabricPage;
