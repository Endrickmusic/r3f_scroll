import { RGBADepthPacking, MeshDepthMaterial, MathUtils, Vector2 } from "three"
import { useRef, useEffect } from "react"
import { useFrame } from '@react-three/fiber'

export default function modMaterial( {planeRef, onDepthMaterialUpdate, hovered, mouse} ) {

    const customUniforms = {
        uTime: { value: 0 },
        uDisplay: { value: 1.0 },
        uMouse: { value: new Vector2(0.5, 0.5) }
      }

    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime() 
        customUniforms.uTime.value = time 
        const transValue = hovered.current ? 3.0 : 1.0
        planeRef.current.rotation.x = planeRef.current.rotation.y = - 0.2 + (Math.sin(time / 5) * 0.3)
        customUniforms.uDisplay.value = MathUtils.lerp(customUniforms.uDisplay.value, transValue, 0.075)
        customUniforms.uMouse.value = mouse
        // console.log('Time:', customUniforms.uTime.value);
        // console.log('Display:', customUniforms.uDisplay.value);
        // console.log('Mouse:', mouse)
      })

    useEffect(() => {

    planeRef.current.material.onBeforeCompile = (shader) => {

        console.log('Shader compilation triggered')
    shader.uniforms = {...customUniforms, ...shader.uniforms }  

    shader.vertexShader = shader.vertexShader.replace(

        '#include <common>',
        `
            #include <common>

            uniform float uTime;
            uniform float uDisplay;
            uniform vec2 uMouse;

            varying vec2 vUv;

            //	Simplex 3D Noise 
            //	by Ian McEwan, Ashima Arts
            //
            vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
            vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
            
            float snoise(vec3 v) { 
              const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
              const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
            
                // First corner
              vec3 i  = floor(v + dot(v, C.yyy) );
              vec3 x0 =   v - i + dot(i, C.xxx) ;
            
                // Other corners
              vec3 g = step(x0.yzx, x0.xyz);
              vec3 l = 1.0 - g;
              vec3 i1 = min( g.xyz, l.zxy );
              vec3 i2 = max( g.xyz, l.zxy );
            
              //  x0 = x0 - 0. + 0.0 * C 
              vec3 x1 = x0 - i1 + 1.0 * C.xxx;
              vec3 x2 = x0 - i2 + 2.0 * C.xxx;
              vec3 x3 = x0 - 1. + 3.0 * C.xxx;
            
                // Permutations
                i = mod(i, 289.0 ); 
                vec4 p = permute( permute( permute( 
                         i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                       + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                       + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
            
                // Gradients
                // ( N*N points uniformly over a square, mapped onto an octahedron.)
              float n_ = 1.0/7.0; // N=7
              vec3  ns = n_ * D.wyz - D.xzx;
            
              vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)
            
              vec4 x_ = floor(j * ns.z);
              vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
            
              vec4 x = x_ *ns.x + ns.yyyy;
              vec4 y = y_ *ns.x + ns.yyyy;
              vec4 h = 1.0 - abs(x) - abs(y);
            
              vec4 b0 = vec4( x.xy, y.xy );
              vec4 b1 = vec4( x.zw, y.zw );
            
              vec4 s0 = floor(b0)*2.0 + 1.0;
              vec4 s1 = floor(b1)*2.0 + 1.0;
              vec4 sh = -step(h, vec4(0.0));
            
              vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
              vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
            
              vec3 p0 = vec3(a0.xy,h.x);
              vec3 p1 = vec3(a0.zw,h.y);
              vec3 p2 = vec3(a1.xy,h.z);
              vec3 p3 = vec3(a1.zw,h.w);
            
                //Normalise gradients
              vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
              p0 *= norm.x;
              p1 *= norm.y;
              p2 *= norm.z;
              p3 *= norm.w;
            
                // Mix final noise value
              vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
              m = m * m;
              return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                            dot(p2,x2), dot(p3,x3) ) );
            }
        ` 
        )

    shader.vertexShader = shader.vertexShader.replace(
            '#include <beginnormal_vertex>',
           
            `
                #include <beginnormal_vertex>
    
                vec2 noiseCoord = uv * vec2(3., 4.) + uMouse;

                // float tilt = 1.0 * uv.y;
                float tilt = 1.0;
            
                // float incline = uv.x * 1.;
                float incline = 1.;
            
                // float offset = 0.5 * incline * mix(-0.5, 0.5, uv.y) ; 
                float offset = 1. ; 
            
                float noise = snoise(
                  vec3(
                  noiseCoord.x + uTime * .15 + uDisplay, 
                  noiseCoord.y + uDisplay + uTime * .1 , 
                  uTime * .18)) ;
                  
                  noise = max(0., noise);

                  objectNormal = vec3(
                    objectNormal.x + noise * 1., 
                    objectNormal.y + noise * 1.4, 
                    objectNormal.z + noise * 1.6 
                    );

            `
        )

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
            #include <begin_vertex>
           
             vec3 pos = vec3(
              position.x + noise * 1.5, 
              position.y + noise * 1.4, 
              position.z + noise * 1.6 
              );

              vUv = uv;
            transformed = pos;
        `
     )
    }
  
  const depthMaterial = new MeshDepthMaterial({
    depthPacking: RGBADepthPacking
  })

  depthMaterial.onBeforeCompile = (shader) =>
   {
    shader.uniforms = {...customUniforms, ...shader.uniforms }  

    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `
          #include <common>

          uniform float uTime;
          uniform float uDisplay;
          uniform vec2 uMouse;

          //	Simplex 3D Noise 
          //	by Ian McEwan, Ashima Arts
          //
          vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
          vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
          
          float snoise(vec3 v) { 
            const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
            const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
          
              // First corner
            vec3 i  = floor(v + dot(v, C.yyy) );
            vec3 x0 =   v - i + dot(i, C.xxx) ;
          
              // Other corners
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min( g.xyz, l.zxy );
            vec3 i2 = max( g.xyz, l.zxy );
          
            //  x0 = x0 - 0. + 0.0 * C 
            vec3 x1 = x0 - i1 + 1.0 * C.xxx;
            vec3 x2 = x0 - i2 + 2.0 * C.xxx;
            vec3 x3 = x0 - 1. + 3.0 * C.xxx;
          
              // Permutations
              i = mod(i, 289.0 ); 
              vec4 p = permute( permute( permute( 
                       i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                     + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                     + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
          
              // Gradients
              // ( N*N points uniformly over a square, mapped onto an octahedron.)
            float n_ = 1.0/7.0; // N=7
            vec3  ns = n_ * D.wyz - D.xzx;
          
            vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)
          
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
          
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
          
            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );
          
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
          
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
          
            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);
          
              //Normalise gradients
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;
          
              // Mix final noise value
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                          dot(p2,x2), dot(p3,x3) ) );
          }
          
      `
      )

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
            #include <begin_vertex>
            vec2 noiseCoord = uv * vec2(3., 4.);

            float tilt = -0.5 * uv.y;
        
            float incline = uv.x * 0.5;
        
            float offset = 0.5 * incline * mix(-0.5, 0.5, uv.y) ; 
        
            float noise = snoise(
              vec3(
              noiseCoord.x + uTime * .15 , 
              noiseCoord.y + uTime * .1 * uDisplay, 
              uTime * .18));
              
              noise = max(0., noise);

              vec3 pos = vec3(
                  position.x, 
                  position.y + noise * 1.4 * uDisplay, 
                  position.z + noise * 1.6 
                  ) ;
    
                transformed = pos;

      `
      )
      
    
       
  

}
planeRef.current.customDepthMaterial = depthMaterial
onDepthMaterialUpdate(depthMaterial.current)
}, [planeRef, onDepthMaterialUpdate])


return null
}


