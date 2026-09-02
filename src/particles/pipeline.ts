// particles/pipeline.ts

// Builds the render pipeline: tells GPU which shader to run and how too


import particleShaderCode from "../shaders/particle.wgsl?raw";


export function createParticlePipeline(
    device: GPUDevice, 
    format: GPUTextureFormat
): GPURenderPipeline {
    const shaderModule = device.createShaderModule({
        code: particleShaderCode,
    });

    return device.createRenderPipeline({
        layout: "auto",
        vertex: {
            module: shaderModule, 
            entryPoint: "vs_main",
            buffers: [
                // Slot 0, quad geometry, advances per vertex

                {
                    arrayStride: 2 * 4, // 2 floats * 4 bytes
                    stepMode: "vertex",
                    attributes: [
                        {shaderLocation: 0, offset: 0, format: "float32x2"}, // position
                    ],
                },

                // Slot 1, per-instance data, advances per instance
                
                {
                    arrayStride: 5 * 4, // 5 floats * 4 bytes
                    stepMode: "instance",
                    attributes: [
                        {shaderLocation: 1, offset: 0, format: "float32x2"}, // offset
                        {shaderLocation: 2, offset: 2 * 4, format: "float32x3"}, // color 
                    ],
                },

            ],
        },
        fragment: {
            module: shaderModule,
            entryPoint: "fs_main",
            targets: [{format}],
        },
        primitive: {
            topology: "triangle-list",
        },
    });
}