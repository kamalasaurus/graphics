void function() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('webgl2');

  canvas.width = 800;
  canvas.height = 600;

  function render() {
    let [r, g, b] = [Math.random(), Math.random(), Math.random()];
    ctx.clearColor(r, g, b, 1.0);
    ctx.clear(ctx.COLOR_BUFFER_BIT);
  }

  setInterval(render, 500);

  document.body.appendChild(canvas);
}();