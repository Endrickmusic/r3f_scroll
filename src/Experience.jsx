import { OrbitControls, RoundedBox } from "@react-three/drei"
import { useLoader } from "@react-three/fiber"
import * as THREE from "three"


export default function Experience(){

  const normalM = useLoader(THREE.TextureLoader, "./Textures/waternormals.jpeg"); 

  return (
    <>
      <OrbitControls />       
        <RoundedBox
          radius={0.01}
          >
          <meshStandardMaterial 
            metalness={1}
            roughness={0.12}
            normalMap={ normalM }
          />
       </RoundedBox>
    </>
  )}