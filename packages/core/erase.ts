export const drawImage = (
  destination: CanvasRenderingContext2D,
  source: CanvasRenderingContext2D,
  globalCompositeOperation: GlobalCompositeOperation = 'source-over'
) => {
  destination.save();
  destination.imageSmoothingEnabled = true;
  destination.imageSmoothingQuality = 'high';
  destination.globalCompositeOperation = globalCompositeOperation;
  destination.resetTransform();
  destination.drawImage(source.canvas, 0, 0);
  destination.restore();
};

/**
 *
 * @param destination context to erase
 * @param source context on which the path is drawn upon
 * @param erasingEffect effect to apply to {@link source} after clipping {@link destination}:
 * - drawing all non erasable visuals to achieve a selective erasing effect.
 * - drawing all erasable visuals without their erasers to achieve an undo erasing effect.
 */
export const erase = (
  destination: CanvasRenderingContext2D,
  source: CanvasRenderingContext2D,
  erasingEffect?: CanvasRenderingContext2D
) => {
  // clip destination
  drawImage(destination, source, 'destination-out');

  // draw erasing effect
  if (erasingEffect) {
    drawImage(source, erasingEffect, 'source-in');
  } else {
    source.save();
    source.resetTransform();
    source.clearRect(0, 0, source.canvas.width, source.canvas.height);
    source.restore();
  }
};
