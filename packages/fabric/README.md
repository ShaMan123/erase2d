# Fabric Erase2d

Fabric bindings for erase2d.
Uses `PencilBrush` for the drawing interaction.

## Caveat

Fabric has clipping limitations that must be worked around in order to support erasing.
I decided not to hack into fabric using prototype mutation to avoid coupling.

This means that an object's clip path is subject to change by `ClippingGroup` when erasing is committed.
It will replace an exiting clip path with `new ClippingGroup([existingClipPath])` if it didn't already so you can expect clip paths to change after their object was erased for the first time.
This has an advantage as well. It allows to clip an object with a number of clip paths simply by adding them to the clipping group so it can be used regardless of erasing.
Best practice might be to use `ClippingGroup` for every clip path. This will keep your object changes to a minimum.

In case you wish to remove the existing clip path but not affect erasing:

```typescript
// check if the object was erased
object.clipPath instanceof ClippingGroup
  ? object.clipPath.remove(
      object.clipPath.item(0) /** the existing clip path is first */
    )
  : delete object.clipPath;
```

## Quick Start

```bash
npm i fabric@beta @erase2d/fabric --save
```

```typescript
import { EraserBrush, ClippingGroup } from '@erase2d/fabric';
import { Circle } from 'fabric';

const circle = new Circle({ radius: 50, erasable: true });
canvas.add(circle);

const eraser = new EraserBrush(canvas);
eraser.width = 30;

eraser.on('start', (e) => {
  // inform something
});

eraser.on('end', (e) => {
  // prevent from committing erasing to the tree
  e.preventDefault();
  const isErased = e.targets.includes(circle);

  // commit erasing manually
  eraser.commit(e.detail);

  const committedEraser = circle.clipPath instanceof ClippingGroup;
});

canvas.freeDrawingBrush = eraser;
canvas.isDrawingMode = true;
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
