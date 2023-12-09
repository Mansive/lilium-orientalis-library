"use client";
import { useEffect, useRef } from "react";
import { OrthographicCamera, useFBO } from "@react-three/drei";
import { Canvas, extend, useFrame } from "@react-three/fiber";
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
  const screenMeshRef = useRef<THREE.Mesh>(null!);
  const networkMaterialRef = useRef<NetworkMaterial>(null!);

  // gaussian blur
  const renderTarget1 = useFBO(); // horizontal blur
  const renderTarget2 = useFBO(); // vertical blur

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
    networkMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    screenMeshRef.current.material = networkMaterialRef.current;
  });

  return (
    <>
      <OrthographicCamera
        makeDefault
        manual={true}
        left={-1}
        right={1}
        top={1}
        bottom={-1}
        near={0}
        far={1}
      />
      <networkMaterial ref={networkMaterialRef} />
      <mesh
        ref={screenMeshRef}
        geometry={getFullScreenTriangle()}
        frustumCulled={false}
      />
    </>
  );
};

function Scene() {
  return (
    <Canvas style={{ width: "100vw", height: "100vh" }}>
      <NetworkShader />
    </Canvas>
  );
}

export default Scene;
