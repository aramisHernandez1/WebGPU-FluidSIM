struct Params {
    dt: f32,
    count: u32,
};

// Flat f32 array to match 5 float layout: x, y, r, g
@group(0) @binding(0) var<storage, read_write> particles: array<f32>;
@group(0) @binding(1) var<uniform> params: Params;

@compute @workgroup_size(64)
fn cs_main(@builtin(global_invocation_id) id: vec3u) {
    let i = id.x;
    if (i >= params.count) { return; }

    let base = i * 5u;
    var p = vec2f(particles[base], particles[base + 1u]);

    let vel = vec2f(-p.y, p.x) * 0.5; // placeholder: just a swirl around the center
    p += vel * params.dt;

    // wrap around the [-1, 1] box
    if (p.x > 1.0) { p.x -= 2.0; }
    if (p.x < -1.0) { p.x += 2.0; }
    if (p.y > 1.0) { p.y -= 2.0; }
    if (p.y < -1.0) { p.y += 2.0; }

    particles[base] = p.x;
    particles[base + 1u] = p.y;
}