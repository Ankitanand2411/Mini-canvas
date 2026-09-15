import type Konva from 'konva';

export function downloadStageAsPng(stage: Konva.Stage, filename: string) {
  const transformer = stage.findOne('Transformer');
  const wasVisible = transformer?.visible() ?? false;
  transformer?.hide();

  // The stage is scaled to fit the viewport; compensate so the export is 2x the canvas size.
  const pixelRatio = 2 / stage.scaleX();
  const url = stage.toDataURL({ pixelRatio, mimeType: 'image/png' });

  if (wasVisible) transformer?.show();

  const link = document.createElement('a');
  link.download = `${filename.replace(/[^a-z0-9-_ ]/gi, '').trim() || 'canvas'}.png`;
  link.href = url;
  link.click();
}
