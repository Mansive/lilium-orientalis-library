import { NoBlending, ShaderMaterial, Vector2 } from "three";
import { ShaderMaterialProps } from "@react-three/fiber";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      gaussianBlurMaterial: ShaderMaterialProps;
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
`

const fragmentShader = `

`;

class GaussianBlurMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {
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

export default GaussianBlurMaterial;
