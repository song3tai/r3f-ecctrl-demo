import "./App.css";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { KeyboardControls, OrbitControls } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import Ecctrl, { EcctrlAnimation } from "ecctrl";
import CharacterModel from "./components/CharacterModel";
import { InfiniteGround } from "./components/InfiniteGround";
import { CHARACTER_MODEL_URL } from "./Constants.ts";
import { EnemySystem } from "./components/EnemySystem";
import { BulletSystem } from "./components/BulletSystem";

function App() {
  const characterRef = useRef(null);
  const [bulletHitPosition, setBulletHitPosition] = useState<THREE.Vector3 | null>(null);

  /**
   * Character animation set preset
   */
  const animationSet = {
    idle: "CharacterArmature|Idle",
    walk: "CharacterArmature|Walk",
    run: "CharacterArmature|Run",
    jump: "CharacterArmature|Jump",
    jumpIdle: "CharacterArmature|Jump_Idle",
    jumpLand: "CharacterArmature|Jump_Land",
    fall: "CharacterArmature|Duck", // This is for falling from high sky
    action1: "CharacterArmature|Wave",
    action2: "CharacterArmature|Death",
    action3: "CharacterArmature|HitReact",
    action4: "CharacterArmature|Punch",
  };

  /**
   * Keyboard control preset
   */
  const keyboardMap = [
    { name: "forward", keys: ["ArrowUp", "KeyW"] },
    { name: "backward", keys: ["ArrowDown", "KeyS"] },
    { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
    { name: "rightward", keys: ["ArrowRight", "KeyD"] },
    { name: "jump", keys: ["Space"] },
    { name: "run", keys: ["Shift"] },
    { name: "action1", keys: ["1"] },
    { name: "action2", keys: ["2"] },
    { name: "action3", keys: ["3"] },
    { name: "action4", keys: ["KeyF"] },
  ];

  const handleBulletHit = (position: THREE.Vector3) => {
    setBulletHitPosition(position.clone());
    // 在下一帧重置，以便能够检测新的碰撞
    setTimeout(() => setBulletHitPosition(null), 0);
  };

  return (
    <>
      <Canvas shadows camera={{ position: [0, 10, 10], fov: 50 }}       
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse') {
          (e.target as HTMLCanvasElement).requestPointerLock()
        }
      }}>
        <directionalLight
          intensity={2.5}
          color={"#FFFFFF"}
          castShadow
          shadow-bias={-0.00006}
          position={[-5, 25, -1]}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-top={30}
          shadow-camera-right={30}
          shadow-camera-bottom={-30}
          shadow-camera-left={-30}
        />
        <hemisphereLight args={[0x8dc1de, 0x00668d, 1.5]} />

        <Suspense fallback={null}>
          <Physics timeStep="vary">
            <KeyboardControls map={keyboardMap}>
              <Ecctrl
                ref={characterRef}
                debug
                animated
                position={[0, 5, 0]}
                camFollowMult={100}
                >
                <EcctrlAnimation
                  characterURL={CHARACTER_MODEL_URL}
                  animationSet={animationSet}
                >
                  <CharacterModel />
                </EcctrlAnimation>
              </Ecctrl>
            </KeyboardControls>
            
            <InfiniteGround characterRef={characterRef} />
            <BulletSystem 
              characterRef={characterRef}
              onBulletHit={handleBulletHit}
            />
            <EnemySystem 
              characterRef={characterRef}
              bulletHitPosition={bulletHitPosition}
            />
          </Physics>
        </Suspense>
        
        <OrbitControls makeDefault />
      </Canvas>
    </>
  );
}

export default App;
