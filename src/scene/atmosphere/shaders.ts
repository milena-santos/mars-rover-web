export const atmosVertex = `
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vViewPos;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

export const atmosFragment = `
  precision highp float;
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vViewPos;
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  uniform float uMinAlpha;
  uniform float uNoiseScale;
  uniform float uBandStrength;
  uniform float uBandWidth;
  uniform float uBreakup;
  uniform float uAltitudeFade;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(p), hash(p + vec3(1,0,0)), f.x), mix(hash(p + vec3(0,1,0)), hash(p + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(p + vec3(0,0,1)), hash(p + vec3(1,0,1)), f.x), mix(hash(p + vec3(0,1,1)), hash(p + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float total = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      total += amplitude * noise(p);
      p *= 2.03;
      amplitude *= 0.5;
    }
    return total;
  }

  void main() {
    vec3 worldNormal = normalize(vWorldNormal);
    vec3 viewDir = normalize(-vViewPos);
    float rim = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), uPower);
    float lat = abs(worldNormal.y);
    float equatorMask = smoothstep(uBandWidth, 0.0, lat);
    float bandMask = mix(1.0, equatorMask, uBandStrength);
    float poleFade = mix(1.0, smoothstep(1.0, 0.15, lat), uAltitudeFade);
    float breakup = fbm(worldNormal * uNoiseScale + vec3(0.0, 0.0, 4.0));
    float wisps = fbm(worldNormal * (uNoiseScale * 2.3) + vec3(8.0, 2.0, 13.0));
    float density = smoothstep(uBreakup, 1.0, breakup * 0.72 + wisps * 0.42);
    float alpha = rim * density * bandMask * poleFade * uIntensity;
    alpha = max(alpha, uMinAlpha * rim * bandMask);
    gl_FragColor = vec4(uColor, alpha);
  }
`;
