// particles/buffers.ts


//Currently just creates 2 vertex buffers needed for our render pipeline

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

    for (let i = 0; i < numInstances; i++){
        const base = i * 5;
        instanceData[base + 0] = (Math.random() * 2 -1) * 0.9; //offsetX
        instanceData[base + 1] = (Math.random() * 2 -1) * 0.9; //offsety
        instanceData[base + 2] = Math.random(); // r
        instanceData[base + 3] = Math.random(); // g
        instanceData[base + 4] = Math.random(); // b
    }


    const buffer = device.createBuffer({
        size: instanceData.byteLength, 
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
    });
    new Float32Array(buffer.getMappedRange()).set(instanceData);
    buffer.unmap();

    return buffer;
}