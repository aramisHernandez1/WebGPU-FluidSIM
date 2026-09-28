import updateShaderCode from "../shaders/update.wgsl?raw";

export function createUpdatePipeline(device: GPUDevice): GPUComputePipeline {
    const module = device.createShaderModule({ code: updateShaderCode });
    return device.createComputePipeline({
        layout: "auto",
        compute: { module, entryPoint: "cs_main" },
    });
}