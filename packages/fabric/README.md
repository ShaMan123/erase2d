# Fabric Erase2d

Fabric bindings for erase2d.
Uses `PencilBrush` for the interaction.

## Quick Start

```bash
npm i fabric@beta @erase2d/fabric --save
```

```typescript
import { EraserBrush } from '@erase2d/fabric';
import { Circle } from 'fabric';

const eraser = new EraserBrush(canvas);
eraser.width = 30;
canvas.freeDrawingBrush = eraser;
canvas.isDrawingMode = true;

eraser.on('start', (e) => {});

// prevent from committing erasing to the tree
eraser.on('end', (e) => e.preventDefault());

const circle = new Circle({ radius: 50, erasable: true });
```

## Migrating from fabric@5

The logic has been reworked from the bottom.
`Eraser` has been removed in favor of the leaner `ClippingGroup`.
Replacing the `type` in your data should be enough.

https://github.com/ShaMan123/erase2d/blob/4c9657f8e2d6c20e7274f49a8f8e6d907f9e02e6/src/fabric/ClippingGroup.ts#L11

```diff
- type: 'eraser'
+ type: 'clipping'
```

## Dev

see main [`README`](../../README.md).
