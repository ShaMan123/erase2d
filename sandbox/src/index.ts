/// <reference path="../node_modules/erase2d/types/fabric.d.ts" />

import { EraserBrush } from 'erase2d';
import * as fabric from 'fabric';
import './styles.css';

const el = document.getElementById('canvas');
const canvas = (window.canvas = new fabric.Canvas(el));

canvas.setDimensions({
  width: window.innerWidth,
  height: window.innerHeight,
});

const eraser = (canvas.freeDrawingBrush = new EraserBrush(canvas));
eraser.width = 30;
canvas.isDrawingMode = true;

let state = 0;
const states = [
  { name: 'erasing', active: true, inverted: false },
  { name: 'undoing erasing', active: true, inverted: true },
  { name: 'default', active: true, inverted: false },
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
  new fabric.Rect({ width: 500, height: 200, fill: 'blue', erasable: true }),
  new fabric.Circle({ radius: 50, erasable: true }),
  button
);

canvas
  .item(0)
  .animate(
    { left: 500 },
    { duration: 6000, onChange: () => canvas.renderAll() }
  );
