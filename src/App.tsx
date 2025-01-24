import "./App.css";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { KeyboardControls, OrbitControls } from "@react-three/drei";
import { Suspense, useRef } from "react";
import Ecctrl, { EcctrlAnimation } from "ecctrl";
import CharacterModel from "./components/CharacterModel";
import { InfiniteGround } from "./components/InfiniteGround";
import { CHARACTER_MODEL_URL } from "./Constants.ts";

function App() {
  const characterRef = useRef(null);

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

  return (
    <>
      <Canvas shadows camera={{ position: [0, 10, 10], fov: 50 }}>
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
          </Physics>
        </Suspense>
        
        <OrbitControls makeDefault />
      </Canvas>
    </>
  );
}

export default App;
