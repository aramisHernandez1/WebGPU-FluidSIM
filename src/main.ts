// main.ts — WebGPU bootstrap

async function main() {
  // Check the browser supports WebGPU at all.
  if (!navigator.gpu) {
    // If there is time should add a fall back if webGPU is not supported.
    throw new Error("WebGPU is not supported in this browser. Use Chrome or Edge.");
  }

  // Request an adapter, representation of the physical GPU.
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error("No GPU adapter found.");
  }

  // Request a device actual handle for issuing GPU commands.
  const device = await adapter.requestDevice();

  const canvas = document.getElementById("webgpu-canvas") as HTMLCanvasElement;
  const context = canvas.getContext("webgpu") as GPUCanvasContext;

  // Match the canvas's pixel size to its displayed CSS size
  // otherwise everything renders blurry or the wrong size.
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;

  // Configure the context: tell it which device will draw to it, and
  // what pixel format to use. getPreferredCanvasFormat() picks the
  // optimal format for the current platform.
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format,
    alphaMode: "opaque",
  });

  // Render loop
  function frame() {
    // A command encoder records a sequence of GPU commands.
    const encoder = device.createCommandEncoder();

    // A render pass is one "drawing" operation. 
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0.05, g: 0.05, b: 0.15, a: 1.0 }, // dark navy
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    pass.end();

    // Submit the recorded commands to the GPU queue for execution.
    device.queue.submit([encoder.finish()]);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  console.log("WebGPU initialized successfully.", { adapter, device, format });
}

main().catch((err) => {
  console.error(err);
  document.body.innerHTML = `<pre style="color:red;padding:2rem;">${err.message}</pre>`;
});