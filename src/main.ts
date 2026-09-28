// main.ts — WebGPU bootstrap



import {initGPU} from "./gpu/context";
import {createQuadVertexBuffer, createInstanceBuffer} from "./particles/buffers";
import {createParticlePipeline} from "./particles/pipeline";
import {createUpdatePipeline} from "./particles/compute";

const NUM_INSTANCES = 100;

async function main(){
  const {device, context, format} = await initGPU("webgpu-canvas");

  const vertexBuffer = createQuadVertexBuffer(device);
  const instanceBuffer = createInstanceBuffer(device, NUM_INSTANCES);

  const pipeline = createParticlePipeline(device, format);

  const updatePipeline = createUpdatePipeline(device);

  const paramsBuffer = device.createBuffer({
    size: 16, // 8 bytes used padded to 16
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const updateBindGroup = device.createBindGroup({
    layout: updatePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: instanceBuffer } },
      { binding: 1, resource: { buffer: paramsBuffer } },
    ],
  });

  let lastTime = performance.now();

  function frame(){
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.033); // Clamp to avoid big jumps
    lastTime = now;

    const params = new ArrayBuffer(16);
    new Float32Array(params, 0, 1)[0] = dt;
    new Uint32Array(params, 4, 1)[0] = NUM_INSTANCES;
    device.queue.writeBuffer(paramsBuffer, 0, params);

    const encoder = device.createCommandEncoder();

    const computePass = encoder.beginComputePass();
    computePass.setPipeline(updatePipeline);
    computePass.setBindGroup(0, updateBindGroup);
    computePass.dispatchWorkgroups(Math.ceil(NUM_INSTANCES / 64));
    computePass.end();


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









