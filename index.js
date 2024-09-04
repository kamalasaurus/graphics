void function() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('webgl2');

  canvas.width = 800;
  canvas.height = 600;

  ctx.clearColor(0.0, 0.0, 0.0, 1.0);
  ctx.clear(ctx.COLOR_BUFFER_BIT);

  document.body.appendChild(canvas);
}();