uniform float uProgress;
uniform float uTime;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 color = inputColor.rgb;

  float gray = dot(color, vec3(0.299, 0.587, 0.114));
  vec3 bw = vec3(gray);

  vec3 sepia = vec3(
    dot(color, vec3(0.393, 0.769, 0.189)),
    dot(color, vec3(0.349, 0.686, 0.168)),
    dot(color, vec3(0.272, 0.534, 0.131))
  );

  // 0.0~0.5: 흑백, 0.5~0.75: 세피아, 0.75~1.0: 컬러
  float colorMix = smoothstep(0.75, 1.0, uProgress);
  float sepiaMix = smoothstep(0.5, 0.75, uProgress) * (1.0 - colorMix);
  vec3 blended = mix(bw, sepia, sepiaMix);
  blended = mix(blended, color, colorMix);

  float grainIntensity = mix(0.12, 0.04, uProgress);
  float grain = random(uv + fract(uTime * 0.1)) - 0.5;
  blended += grain * grainIntensity;

  float vignetteStrength = mix(0.5, 0.2, uProgress);
  vec2 center = uv - 0.5;
  float vignette = 1.0 - dot(center, center) * vignetteStrength * 4.0;
  blended *= vignette;

  outputColor = vec4(blended, inputColor.a);
}
