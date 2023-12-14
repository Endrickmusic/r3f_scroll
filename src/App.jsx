import * as THREE from 'three'
import { useRef, useState } from 'react'
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber'
import { useFBO, 
         useGLTF, 
         useScroll, Text, Image, Scroll, Preload, ScrollControls, MeshTransmissionMaterial, 
         useTexture,
         useEnvironment
 } from '@react-three/drei'
import { easing } from 'maath'

export default function App() {
  return (

    <Canvas camera={{ position: [0, 0, 20], fov: 15 }}>
      <ScrollControls damping={0.2} pages={3} distance={0.5}>
        <Lens>

          <TransTorus />
          <GoldTorus />

          <Scroll>
            <Typography />
            <Images />
           

          </Scroll>
          <Scroll html>

            <div style={{ transform: 'translate3d(65vw, 192vh, 0)' }}>
              Ich mache 
              <br />
              alles für
              <br />
              ihr Geld.
              <br />
            </div>
          </Scroll>
          {/** This is a helper that pre-emptively makes threejs aware of all geometries, textures etc
               By default threejs will only process objects if they are "seen" by the camera leading 
               to jank as you scroll down. With <Preload> that's solved.  */}
          <Preload />
        </Lens>
      </ScrollControls>
    </Canvas>
  )
}

function Lens({ children, damping = 0.15, ...props }) {
  const ref = useRef()
  // const { nodes } = useGLTF('/lens-transformed.glb')
  const roughnessMap = useTexture('./Textures/waternormals.jpeg')
  const buffer = useFBO()
  const viewport = useThree((state) => state.viewport)
  const [scene] = useState(() => new THREE.Scene())
  useFrame((state, delta) => {
    // Tie lens to the pointer
    // getCurrentViewport gives us the width & height that would fill the screen in threejs units
    // By giving it a target coordinate we can offset these bounds, for instance width/height for a plane that
    // sits 15 units from 0/0/0 towards the camera (which is where the lens is)
    const viewport = state.viewport.getCurrentViewport(state.camera, [0, 0, 15])
    easing.damp3(
      ref.current.position,
      [(state.pointer.x * viewport.width) / 2, (state.pointer.y * viewport.height) / 2, 15],
      damping,
      delta
    )
    // This is entirely optional but spares us one extra render of the scene
    // The createPortal below will mount the children of <Lens> into the new THREE.Scene above
    // The following code will render that scene into a buffer, whose texture will then be fed into
    // a plane spanning the full screen and the lens transmission material
    state.gl.setRenderTarget(buffer)
    state.gl.setClearColor('#d8d7d7')
    state.gl.render(scene, state.camera)
    state.gl.setRenderTarget(null)

    // Rotation of the cube
    ref.current.rotation.x = ref.current.rotation.y += delta / 3

  })
  return (
    <>
      {createPortal(children, scene)}
      <mesh scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} />
      </mesh>
      <mesh scale={0.35} ref={ref} 
      rotation={[Math.PI / 3, Math.PI / 3, Math.PI / 3]} 
      // geometry={nodes.Cylinder.geometry} 
      {...props}>
        <boxGeometry />
        <MeshTransmissionMaterial 
          // buffer={buffer.texture} 
          buffer={ false } 
          ior={1.2} 
          thickness={1.5} 
          anisotropy={0.1} 
          chromaticAberration={0.04} 
          roughness = {0.2}
          backside = {true}
          backsideThickness = { 0.1 }
          transmission = {1}
          />
      </mesh>
    </>
  )
}

function Images() {
  const group = useRef()
  const data = useScroll()
  const { width, height } = useThree((state) => state.viewport)
  useFrame(() => {
    group.current.children[0].material.zoom = 1 + data.range(0, 1 / 3) / 3
    group.current.children[1].material.zoom = 1 + data.range(0, 1 / 3) / 3
    group.current.children[2].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2
    group.current.children[3].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2
    group.current.children[4].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2
    group.current.children[5].material.grayscale = 1 - data.range(1.6 / 3, 1 / 3)
    group.current.children[6].material.zoom = 1 + (1 - data.range(2 / 3, 1 / 3)) / 3
  })
  return (
    <group ref={group}>
      <Image position={[-2, 0, 0]} scale={[4, height, 1]} url="./img/Colorcube_octane_15.png" />
      <Image position={[2, 0, 3]} scale={3} url="./img/crystal_9.png" />
      <Image position={[-2.05, -height, 6]} scale={[1, 3, 1]} url="./img/dispersion_octane_08.png" />
      <Image position={[-0.6, -height, 9]} scale={[1, 2, 1]} url="./img/more_money_02.png" />
      <Image position={[0.75, -height, 10.5]} scale={1.5} url="./img/nohdri0114.png" />
      <Image position={[0, -height * 1.5, 7.5]} scale={[1.5, 3, 1]} url="./img/ocean_iridescent_05.png" />
      <Image position={[0, -height * 2 - height / 4, 0]} scale={[width / 2, height / 1.1, 1]} url="./img/ocean_iridescent_27.png" />
    </group>
  )
}

function Typography() {
  const state = useThree()
  const { width, height } = state.viewport.getCurrentViewport(state.camera, [0, 0, 12])
  const shared = { font: '/Inter-Regular.woff', letterSpacing: -0.07, color: 'black' }
  return (
    <>
      <Text children="Christian" anchorX="left" position={[-width / 2.5, -height / 10, 12]} {...shared} />
      <Text children="Hohenbild" anchorX="right" position={[width / 2.5, -height * 2, 12]} {...shared} />
      <Text children="Portfolio" position={[0, -height * 4.624, 12]} {...shared} />
    </>
  )
}

function TransTorus(){

  const torusRef = useRef()
  useFrame((state, delta) => {
    torusRef.current.rotation.x = torusRef.current.rotation.y += delta / 3
  })
  return(
    <mesh
    ref={torusRef}
    scale={0.2}
    position={[-2.0, 0.5, 3]}
    >
        <torusGeometry
        args={[1.6, 0.4, 16, 100, 2*Math.PI]}
        />
        <MeshTransmissionMaterial 
        buffer={ false } 
    ior={1.2} 
    thickness={1.0} 
    anisotropy={0.3} 
    chromaticAberration={0.04} 
    roughness = {0.6}
    backside = {true}
    backsideThickness = { 0.1 }
    transmission = {1}
    />
</mesh>
  )
}

function GoldTorus(){

  const goldRef = useRef()

  const envMap = useEnvironment({ files: './Environments/envmap.hdr' })
  const normalMap = useTexture("./Textures/waternormals.jpeg")

  useFrame((state, delta) => {
    goldRef.current.rotation.x += delta / 3
    goldRef.current.rotation.y += delta / 1.9
  })
  return(
    <mesh
    ref={goldRef}
    scale={0.2}
    position={[3.0, -0.5, 4]}
    >
        <torusGeometry
        args={[1.6, 0.4, 16, 100, 2*Math.PI]}
        />
        <meshStandardMaterial 
    roughness = {0.05}
    metalness = {1}
    envMap={envMap}
    normalMap={normalMap}
    color={"gold"}
    
    />
</mesh>
  )
}