
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, DoubleSide } from "three";
// import { shaderMaterial } from '@react-three/drei'

import vertexShader from './shader/MovingPlane/vertexShader'
import fragmentShader from './shader/MovingPlane/fragmentShader'

export default function MovingPlane(){

  // This reference will give us direct access to the mesh
  const mesh = useRef();

  const uniforms = useMemo(
    () => ({
      u_time: {
        value: 0.0,
      },
      u_colorA: { value: new Color("#FFE486") },
      u_colorB: { value: new Color("#FEB3D9") },
    }), []
  );

useFrame((state, delta) => {
    const { clock } = state;
    // mesh.current.material.uniforms.u_time.value = clock.getElapsedTime();
    mesh.current.material.uniforms.u_time.value += delta;
  });

  return (
    <mesh 
    ref={mesh} 
    position={[-1.5, -3.1, 2]} 
    rotation={[-Math.PI, Math.PI/16, Math.PI/16]} 
    scale={2.5}>
      <planeGeometry args={[1, 1, 64, ]}
      />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        wireframe={false}
        side= {DoubleSide}
      />
    </mesh>
  );
};