// main.ts — WebGPU bootstrap



import {initGPU} from "./gpu/context";
import {createQuadVertexBuffer, createInstanceBuffer} from "./particles/buffers";
import {createParticlePipeline} from "./particles/pipeline";

const NUM_INSTANCES = 100;

async function main(){
  const {device, context, format} = await initGPU("webgpu-canvas");

  const vertexBuffer = createQuadVertexBuffer(device);
  const instanceBuffer = createInstanceBuffer(device, NUM_INSTANCES);

  const pipeline = createParticlePipeline(device, format);

  function frame(){
    const encoder = device.createCommandEncoder();

    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: {r: 0.05, g:0.5, b:0.15, a:1.0}, //dark navy 
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.setVertexBuffer(1, instanceBuffer);
    pass.draw(6, NUM_INSTANCES);
    pass.end();

    device.queue.submit([encoder.finish()]);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  console.log("WebGPU initialized successfully.", {device, format});
}

main().catch((err) => {
  console.error(err);
  document.body.innerHTML = `<pre style="color:red;padding:2rem;">${err.message}</pre>`
});









