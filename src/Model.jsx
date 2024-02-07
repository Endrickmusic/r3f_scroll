import React from "react";
import { useEnvironment, useTexture } from "@react-three/drei";

import { DoubleSide, MathUtils, RGBADepthPacking, MeshDepthMaterial } from "three"
import { useRef, useEffect, useState } from "react"

import ModifiedShader from './NoiseShader.jsx'

export default function Model({onDepthMaterialUpdate}) {
  console.log("Model component rendered");
  const planeRef = useRef()
  const materialRef = useRef()
  const mouseRef = useRef({ x: 0, y: 0 })

  const hovered = useRef(false)
  const transValue = hovered.current ? 1.5 : 1.0
  const defaultUv = [0.5, 0.5]

  console.log('hovered:', hovered.current)
  console.log(planeRef.current)

    useEffect(() => {
      console.log('useEffect triggered')
      console.log(materialRef)
        // ModifiedShader(planeRef, onDepthMaterialUpdate)    
    }, [hovered])

    const handleMouseMove = (e) => {
      mouseRef.current.x = 1 - e.uv.x;
      mouseRef.current.y = 1 - e.uv.y;
    };
      // const [uv, setUv] = useState(defaultUv)
      // const [clicked, click] = useState(false)
    

    const normalTexture = useTexture('./textures/waternormals.jpeg')
    const imageTexture = useTexture('./textures/gradient.png')
    const envMap = useEnvironment({files : './Environments/envmap.hdr'})

    const handleDepthMaterial = (material) => {
      // Do something with the depth material received from the child
      planeRef.current.custumDepthMaterial = material;
      console.log('Depth material received:', material);
    };

  return (
    <group dispose={null}>
      <mesh
      onPointerMove={handleMouseMove}
      // onClick={(e) => click(!clicked)}
      ref = { planeRef }
      scale = {0.2}
      rotation = { [-0.2*Math.PI, 0.1*Math.PI, 0] }
      onPointerOver = {(e) => hovered.current = true}
      onPointerOut = {(e) => hovered.current = false}
      // customDepthMaterial={depthMaterial}
      castShadow
      receiveShadow
      >
        <planeGeometry
        args ={[16, 16, 128, 128]}
        
        />
        <meshStandardMaterial 
        ref={ materialRef }
        // onBeforeCompile = { onBeforeCompile }
        color = { 0xffffff }
        map = { imageTexture }
        envMap = { envMap }
        envMapIntensity = { 0.0 }
        normalMap = {normalTexture }
        normalScale = { [0.035, 0.035] }
        roughness = { 0.12 }
        metalness = { 0.5 }
        side = { DoubleSide }
        flatShading = { false }
        emissiveIntensity = { .75 }
        emissiveMap = { imageTexture }
        emissive = { 0xffffff }
        />

      </mesh>
      <ModifiedShader 
      planeRef = {planeRef}
      onDepthMaterialUpdate = {handleDepthMaterial} 
      hovered = {hovered}
      mouse = {mouseRef.current}
      />
    </group>
  )
}
