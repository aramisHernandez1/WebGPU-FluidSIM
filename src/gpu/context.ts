// gpu/context.ts

export interface GPUContext {
    device: GPUDevice;
    context: GPUCanvasContext;
    format: GPUTextureFormat;
    canvas: HTMLCanvasElement;
}

export async function initGPU(canvasId: string): Promise<GPUContext> {
    if (!navigator.gpu) {
        throw new Error("WebGPU is not supported in this browser. Try using Chrome or Edge.");
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error("No GPU adapter found.");
    }

    const device = await adapter.requestDevice();

    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const context = canvas.getContext("webgpu") as GPUCanvasContext;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;

    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device, 
        format, 
        alphaMode: "opaque",
    });

    return {device, context, format, canvas};
}