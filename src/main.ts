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

  const quadVertices = new Float32Array([
    // x,  y
    -0.5, -0.5,
     0.5, -0.5,
     0.5,  0.5,
    
    -0.5, -0.5,
     0.5, 0.5,
    -0.5, 0.5
  ]);

  const vertexBuffer = device.createBuffer({
    size: quadVertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  });
  new Float32Array(vertexBuffer.getMappedRange()).set(quadVertices);
  vertexBuffer.unmap();

  const NUM_INSTANCES = 100;

  // Per instance: offsetX, offsetY, r, g, b (5 floats = 20 bytes each)
  const instanceData = new Float32Array(NUM_INSTANCES * 5);

  for (let i = 0; i < NUM_INSTANCES; i++){
    const base = i * 5;
    instanceData[base + 0] = (Math.random() * 2 - 1) * 0.9; // offsetX
    instanceData[base + 1] = (Math.random() * 2 - 1) * 0.9; // offsetY
    instanceData[base + 2] = Math.random();
    instanceData[base + 3] = Math.random();
    instanceData[base + 4] = Math.random();
  }

  const instanceBuffer = device.createBuffer({
    size: instanceData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  });
  new Float32Array(instanceBuffer.getMappedRange()).set(instanceData);
  instanceBuffer.unmap();


  // Shader and Pipeline setup
  const shaderModule = device.createShaderModule({
    code: `
      struct VertexInput {
        @location(0) position: vec2f,  //from quad geometry buffer
        @location(1) instanceOffset: vec2f, // from instance buffer
        @location(2) instanceColor: vec3f, // from instance buffer
      };

      struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) color: vec3f
      }

      @vertex
      fn vs_main(in: VertexInput) -> VertexOutput {
        var out: VertexOutput; 
        let scale = 0.05; // shrink quad down so they all fit on the screen
        out.position = vec4f(in.position * scale + in.instanceOffset, 0.0, 1.0);
        out.color = in.instanceColor;
        return out;
      }

      @fragment
      fn fs_main(in: VertexOutput) -> @location(0) vec4f {
        return vec4f(in.color, 1.0);
      }
    `,
  });

  const pipeline = device.createRenderPipeline({
    layout: "auto", 
    vertex: {
      module: shaderModule,
      entryPoint: "vs_main",

      buffers: [
        // Slot 0: quad geometry
        {
          arrayStride: 2 * 4, //2 floats * 4 bytes
          stepMode: "vertex",
          attributes: [
            {shaderLocation: 0, offset: 0, format: "float32x2"}, //position
          ],
        },

        // Slot 1: per-instance data - advances per instance
        {
          arrayStride: 5 * 4, // 5 Floats * 4 bytes
          stepMode: "instance",
          attributes: [
            { shaderLocation: 1, offset: 0,     format: "float32x2"}, //offset
            { shaderLocation: 2, offset: 2 * 4, format: "float32x3"}, //color
          ],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fs_main",
      targets: [{ format  }],
    },
    primitive: {
      topology: "triangle-list",
    },
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

    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.setVertexBuffer(1, instanceBuffer);
    pass.draw(6, NUM_INSTANCES);

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