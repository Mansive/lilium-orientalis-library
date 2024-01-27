"use client";
import { OrthographicCamera, useFBO, Stats } from "@react-three/drei";
import { Canvas, createPortal, extend, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, memo } from "react";
import * as THREE from "three";

import NetworkMaterial from "./NetworkMaterial";

extend({ NetworkMaterial });

const getFullScreenTriangle = () => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)
  );

  geometry.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2)
  );

  return geometry;
};

const NetworkShader = () => {
  // Improve performance by reducing width and height
  const width = window.innerWidth / 3;
  const height = window.innerHeight / 3;

  const cameraRef = useRef<THREE.OrthographicCamera>(null!);
  const screenMeshRef = useRef<THREE.Mesh>(null!);
  const networkMaterialRef = useRef<NetworkMaterial>(null!);

  const scene = new THREE.Scene();
  const renderTarget = useFBO(width, height, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: false,
    type: THREE.FloatType,
  });

  useEffect(() => {
    const onWindowResize = () => {
      networkMaterialRef.current.uniforms.uResolution.value = new THREE.Vector2(
        window.innerWidth,
        window.innerHeight
      ).multiplyScalar(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  useFrame((state) => {
    const { gl, clock } = state;

    gl.setRenderTarget(renderTarget);
    gl.clear();

    networkMaterialRef.current.uniforms.uTime.value = clock.elapsedTime;

    gl.render(scene, cameraRef.current);

    (screenMeshRef.current.material as THREE.MeshBasicMaterial).map =
      renderTarget.texture;

    gl.setRenderTarget(null);
  });

  return (
    <>
      {createPortal(
        <mesh geometry={getFullScreenTriangle()}>
          <networkMaterial ref={networkMaterialRef} />
        </mesh>,
        scene
      )}
      <OrthographicCamera
        ref={cameraRef}
        makeDefault
        manual={true}
        left={-1}
        right={1}
        top={1}
        bottom={-1}
        near={0}
        far={1}
      />
      <mesh ref={screenMeshRef} geometry={getFullScreenTriangle()} />
    </>
  );
};

function Scene() {
  return (
    <Canvas
      style={{
        width: "100dvw",
        height: "100dvh",
        filter: "blur(0.8rem)",
        mixBlendMode: "hard-light",
      }}
    >
      <Suspense>
        <Stats />
        <NetworkShader />
      </Suspense>
    </Canvas>
  );
}

export default memo(Scene);
