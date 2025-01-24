import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

interface Bullet {
  id: number;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  createdAt: number;
  startPosition: THREE.Vector3; // 添加发射起始位置
}

interface BulletSystemProps {
  characterRef: React.MutableRefObject<any>;
  onBulletHit: (bulletPosition: THREE.Vector3) => void;
}

const BULLET_SPEED = 30;
const BULLET_SIZE = 0.2;
const BULLET_INTERVAL = 100; // 发射间隔（毫秒）
const BULLET_RANGE = 20; // 减小射程到20个单位
const MAX_BULLETS = 20; // 减少最大子弹数量
const MAX_BULLET_AGE = 3000; // 减少最大存活时间到3秒

export function BulletSystem({ characterRef, onBulletHit }: BulletSystemProps) {
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const bulletIdCounter = useRef(0);
  const lastShootTime = useRef(0);

  // 发射子弹
  const shootBullet = () => {
    if (!characterRef.current) return;

    const currentTime = Date.now();
    if (currentTime - lastShootTime.current < BULLET_INTERVAL) return;

    const characterPosition = characterRef.current.translation();
    const characterRotation = characterRef.current.rotation();
    
    const direction = new THREE.Vector3(0, 0, 1);
    const quaternion = new THREE.Quaternion(
      characterRotation.x,
      characterRotation.y,
      characterRotation.z,
      characterRotation.w
    );
    direction.applyQuaternion(quaternion);

    const startPos = new THREE.Vector3(
      characterPosition.x,
      characterPosition.y + 0.5,
      characterPosition.z
    );

    const position = startPos.clone().add(direction.multiplyScalar(2));

    const newBullet: Bullet = {
      id: bulletIdCounter.current++,
      position,
      direction: direction.normalize(),
      createdAt: currentTime,
      startPosition: startPos // 记录发射起始位置
    };

    setBullets(prev => {
      if (prev.length >= MAX_BULLETS) {
        return [...prev.slice(1), newBullet];
      }
      return [...prev, newBullet];
    });

    lastShootTime.current = currentTime;
  };

  // 处理子弹碰撞
  const handleBulletHit = (bulletId: number, position: THREE.Vector3) => {
    onBulletHit(position);
    setBullets(prev => prev.filter(bullet => bullet.id !== bulletId));
  };

  // 更新子弹位置
  useFrame((_, delta) => {
    shootBullet();

    const currentTime = Date.now();

    setBullets(prev => prev.filter(bullet => {
      // 更新子弹位置
      bullet.position.add(
        bullet.direction.clone().multiplyScalar(BULLET_SPEED * delta)
      );

      // 计算从起始位置到当前位置的实际距离
      const distanceTraveled = bullet.position.distanceTo(bullet.startPosition);
      const age = currentTime - bullet.createdAt;

      // 如果超出射程或存活时间过长，移除子弹
      return distanceTraveled < BULLET_RANGE && age < MAX_BULLET_AGE;
    }));
  });

  return (
    <group>
      {bullets.map(bullet => (
        <RigidBody
          key={bullet.id}
          type="dynamic"
          position={[bullet.position.x, bullet.position.y, bullet.position.z]}
          sensor
          onIntersectionEnter={(payload) => {
            if (payload.other.rigidBodyObject) {
              handleBulletHit(bullet.id, bullet.position);
            }
          }}
        >
          <mesh castShadow>
            <sphereGeometry args={[BULLET_SIZE, 8, 8]} />
            <meshStandardMaterial
              color="#FFD700"
              emissive="#FFA500"
              emissiveIntensity={0.5}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
} 