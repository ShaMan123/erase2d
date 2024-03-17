# Erase2d

A simple erasing tool.
Currently supports fabric out of the box.

## Quick Start

```bash
npm i erase2d
```

```typescript
import { EraserBrush } from 'erase2d';

const eraser = new EraserBrush(canvas);
eraser.width = 30;
canvas.freeDrawingBrush = eraser;
canvas.isDrawingMode = true;

// prevent from committing erasing to the tree
eraser.on('end', (e) => e.preventDefault())
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

```bash
npm start
```

## Publish

```bash
npm version <type>
npm publish
```
