
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, ContactShadows, Float } from '@react-three/drei'
import { Suspense } from 'react'
import glbUrl from '@/3d/myphotobooth.glb?url' // Assuming usage of vite alias or relative import support

function Model() {
  const { scene } = useGLTF(glbUrl)
  return <primitive object={scene} scale={2} position={[0, -1, 0]} />
}

export function Photobooth3DExperience({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="relative w-full h-screen bg-neutral-950">
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Model />
          </Float>
          <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
        </Suspense>
        
        <OrbitControls 
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>

      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center z-10 transition-opacity duration-700 animate-in fade-in slide-in-from-bottom-8">
        <h2 className="text-4xl font-black text-white mb-6 tracking-tighter drop-shadow-lg">
          ENTER THE <span className="text-rose-500">BOOTH</span>
        </h2>
        
        <button
          onClick={onComplete}
          className="px-10 py-5 bg-white text-black font-bold text-xl rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)]"
        >
          START SESSION
        </button>
        
        <p className="mt-4 text-white/50 text-sm font-mono uppercase tracking-widest">
          Drag to Rotate • Scroll to Zoom
        </p>
      </div>
    </div>
  )
}
