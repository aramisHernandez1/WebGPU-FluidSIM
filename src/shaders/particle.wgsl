struct VertexInput {
  @location(0) position: vec2f,       // from quad geometry buffer
  @location(1) instanceOffset: vec2f, // from instance buffer
  @location(2) instanceColor: vec3f,  // from instance buffer
};

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec3f,
};

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
