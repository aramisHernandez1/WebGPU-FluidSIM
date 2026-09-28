// particles/buffers.ts

// Creates the two vertex buffers needed for the render pipeline.
// The instance buffer is also a storage buffer so the compute pass can write to it.

export function createQuadVertexBuffer(device: GPUDevice): GPUBuffer {
    const quadVertices = new Float32Array([
        // x,    y
        -0.5, -0.5,
         0.5, -0.5,
         0.5,  0.5,

        -0.5, -0.5,
         0.5,  0.5,
        -0.5,  0.5,
    ]);

    const buffer = device.createBuffer({
        label: "quad vertex buffer",
        size: quadVertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
    });
    new Float32Array(buffer.getMappedRange()).set(quadVertices);
    buffer.unmap();

    return buffer;
}

export function createInstanceBuffer(
    device: GPUDevice,
    numInstances: number
): GPUBuffer {
    // Per instance: offsetX, offsetY, r, g, b (5 floats = 20 bytes each)
    const instanceData = new Float32Array(numInstances * 5);

    for (let i = 0; i < numInstances; i++) {
        const base = i * 5;
        instanceData[base + 0] = (Math.random() * 2 - 1) * 0.9; // offsetX
        instanceData[base + 1] = (Math.random() * 2 - 1) * 0.9; // offsetY
        instanceData[base + 2] = Math.random(); // r
        instanceData[base + 3] = Math.random(); // g
        instanceData[base + 4] = Math.random(); // b
    }

    const buffer = device.createBuffer({
        label: "instance buffer",
        size: instanceData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
    });
    new Float32Array(buffer.getMappedRange()).set(instanceData);
    buffer.unmap();

    return buffer;
}