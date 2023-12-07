"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import SearchBar from "@/components/SearchBar";
import SearchResultList from "@/components/SearchResultList";

import { Book, BOOKS } from "@/data/book-data";

import styles from "./page.module.css";

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
    vec2 r = randv2(gId + offset) * uTime;

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

  void main() {
    vec2 fragCoord = vUv * uResolution;
    vec2 uv = (fragCoord - 0.5 * uResolution.xy) / uResolution.y;

    uv *= 6.0;

    vec2 gUv = fract(uv) - 0.5;
    vec2 gId = floor(uv);

    vec2 p[9];
    int i = 0;
    for (float y = -1.; y <= 1.; y++) {
      for (float x = -1.; x <= 1.; x++) {
        p[i++] = randPosCell(gId, vec2(x, y));
      }
    }

    float m = 0.0;
    for (int i = 0; i < 9; i++) {
      m += line(gUv, p[4], p[i]);

      vec2 v = (p[i] - gUv) * 20.0;
      float sparkle = 1.0 / dot(v, v);

      m += sparkle;
    }
    m += line(gUv, p[1], p[3]);
    m += line(gUv, p[1], p[5]);
    m += line(gUv, p[3], p[7]);
    m += line(gUv, p[5], p[7]);

    vec3 col = vec3(m);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const GraphEffect = () => {
  const viewport = useThree((state) => state.viewport);

  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: {
        type: "f",
        value: 0.0,
      },
      uResolution: {
        type: "v2",
        value: null,
      },
    }),
    []
  );

  useFrame((state) => {
    const { clock, viewport } = state;
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.getElapsedTime();
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uResolution.value = new THREE.Vector2(viewport.width, viewport.height);
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default function Home() {
  return (
    <main>
      <Canvas style={{ width: "100vw", height: "100vh" }}>
        <GraphEffect />
      </Canvas>
    </main>
  );
}

/*
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Book[] | null>(null);

  // idle | loading | success | error
  const [status, setStatus] = React.useState("idle");

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("loading");

    const nextSearchResults = BOOKS.filter(({ title }) =>
      title.includes(searchTerm)
    );
    setSearchResults(nextSearchResults);

    setStatus("success");
  }

      <div className={styles.wrapper}>
        <div className={styles.mainHeading}>
          <h1>lolibrary</h1>
        </div>
        <div className={styles.search}>
          <form onSubmit={handleSearch}>
            <SearchBar
              placeholder="Enter book title"
              value={searchTerm}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(event.target.value);
              }}
            />
          </form>
        </div>
        {status === "success" && (
          <SearchResultList searchResults={searchResults} />
        )}
      </div>
*/
