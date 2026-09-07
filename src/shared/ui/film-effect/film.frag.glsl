uniform float uProgress;
uniform float uTime;
uniform float uGrain;
uniform float uVignette;
uniform float uBW;
uniform float uRedTint;

float random(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453 + uTime * 0.1);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 color = inputColor.rgb;

  // B&W
  float lum = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(lum), color, 1.0 - uBW);

  // Red tint
  if (uRedTint > 0.0) {
    color = mix(color, vec3(color.r * 1.3, color.g * 0.7, color.b * 0.7), uRedTint);
  }

  // Grain
  float grain = (random(uv) - 0.5) * uGrain;
  color += grain;

  // Vignette
  vec2 vigUV = uv - 0.5;
  float vig = 1.0 - dot(vigUV, vigUV) * uVignette * 4.0;
  color *= clamp(vig, 0.0, 1.0);

  outputColor = vec4(color, inputColor.a);
}
