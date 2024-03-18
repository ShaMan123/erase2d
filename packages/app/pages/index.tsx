import { EraserBrush, isTransparent } from '@erase2d/fabric';
import * as fabric from 'fabric';
import { NextPage } from 'next';
import { useCallback, useEffect, useRef } from 'react';
import { Canvas } from '../components/Canvas';

const IndexPage: NextPage = () => {
  const ref = useRef<fabric.Canvas>(null);
  const workerRef = useRef<Worker>();

  useEffect(() => {
    const worker = new Worker(new URL('../worker.ts', import.meta.url));
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

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
          'c?',
          await Promise.all(
            e.detail.targets.map(async (target) => [
              target,
              await isTransparent(target, workerRef.current),
            ])
          )
        );
      });
      canvas.isDrawingMode = true;

      let state = 0;
      const states = [
        { name: 'erasing', active: true, inverted: false },
        { name: 'undoing erasing', active: true, inverted: true },
        { name: 'default', active: false, inverted: false },
      ];
      const button = new fabric.FabricText('', { backgroundColor: 'magenta' });
      const setState = (_state: number) => {
        state = _state;
        const { name, active, inverted } = states[state];
        button.set('text', `Tool: ${name}`);
        canvas.isDrawingMode = active;
        eraser.inverted = inverted;
        canvas.requestRenderAll();
      };
      setState(0);
      button.on('mouseup', ({ isClick }) => {
        isClick && setState((state + 1) % 3);
      });

      canvas.add(
        new fabric.Rect({
          width: 500,
          height: 200,
          fill: 'blue',
          erasable: true,
          clipPath: new fabric.Circle({ radius: 50, inverted: true }),
        }),
        new fabric.Circle({ radius: 50, erasable: true }),
        button
      );

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
    [ref, workerRef]
  );

  return (
    <div className="position-relative">
      <Canvas ref={ref} onLoad={onLoad} />
    </div>
  );
};

export default IndexPage;
