import { ShaderMaterialProps } from "@react-three/fiber";
import { NoBlending, ShaderMaterial, Vector2 } from "three";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      networkMaterial: ShaderMaterialProps;
    }
  }
}

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    vUv = uv;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;

  varying vec2 vUv;

  // sine randomness function from The Book Of Shaders
  float randf(vec2 p) {
    return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  vec2 randv2(vec2 p) {
    float r = randf(p);
    return vec2(r, randf(p + r));
  }

  vec2 randPosCell(vec2 gId, vec2 offset) {
    vec2 r = randv2(gId + offset) * uTime * 0.6;

    return sin(r) * 0.4 + offset;
  }

  float pointSegmentDistance(vec2 p, vec2 a, vec2 b) {
    vec2 ab = b - a;
    vec2 ap = p - a;

    float d = clamp(dot(ap, ab) / dot(ab, ab), 0.0, 1.0);

    return length(ap - ab * d);
  }

  float line(vec2 p, vec2 a, vec2 b) {
    float d = pointSegmentDistance(p, a, b);
    float m = smoothstep(0.03, 0.01, d);
    m *= smoothstep(1.0, 0.8, length(a - b));
    return m;
  }

  float layer(vec2 uv) {
    vec2 gUv = fract(uv) - 0.5;
    vec2 gId = floor(uv);

    vec2 p[9];
    int i = 0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        p[i++] = randPosCell(gId, vec2(x, y));
      }
    }

    float m = 0.0;
    for (int i = 0; i < 9; i++) {
      m += line(gUv, p[4], p[i]);

      vec2 v = (p[i] - gUv) * 20.0;
      float sparkle = 0.5 / dot(v, v);

      m += sparkle;
    }
    m += line(gUv, p[1], p[3]);
    m += line(gUv, p[1], p[5]);
    m += line(gUv, p[3], p[7]);
    m += line(gUv, p[5], p[7]);

    return m;
  }

  void main() {
    vec2 fragCoord = vUv * uResolution;
    vec2 uv = (fragCoord - 0.5 * uResolution.xy) / uResolution.y;

    float m = 0.0;
    for (float i = 0.0; i < 1.0; i += 1.0 / 4.0) {
      float z = fract(i + uTime * 0.04);
      float size = mix(8.0, 0.4, z);
      float fade = smoothstep(0.0, 0.8, z) * smoothstep(1.0, 0.7, z);
      m += layer(uv * size + i * 20.0) * fade;
    }

    vec3 col = vec3(m);
    gl_FragColor = vec4(col, 1.0);
  }
`;

class NetworkMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTime: {
          value: 0.0,
        },
        uResolution: {
          value: new Vector2(
            window.innerWidth,
            window.innerHeight
          ).multiplyScalar(Math.min(window.devicePixelRatio, 2)),
        },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
    });
  }
}

export default NetworkMaterial;
