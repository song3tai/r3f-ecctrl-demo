import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

interface Enemy {
  id: number;
  position: THREE.Vector3;
  color: string; // 添加颜色属性
}

interface EnemySystemProps {
  characterRef: React.MutableRefObject<any>;
  bulletHitPosition: THREE.Vector3 | null;
}

const SPAWN_INTERVAL = 2000; // 生成间隔（毫秒）
const SPAWN_DISTANCE = 30; // 生成距离
const ENEMY_SPEED = 5; // 敌人移动速度
const ENEMY_SIZE = 1; // 敌人大小
const DESPAWN_DISTANCE = 50; // 消失距离
const COLLISION_DISTANCE = 2; // 碰撞距离

// 随机颜色生成函数
const getRandomColor = () => {
  const colors = [
    '#FF6B6B', // 红色
    '#4ECDC4', // 青色
    '#45B7D1', // 蓝色
    '#96CEB4', // 绿色
    '#FFEEAD', // 黄色
    '#D4A5A5', // 粉色
    '#9B59B6', // 紫色
    '#E67E22', // 橙色
    '#2ECC71', // 翠绿
    '#F1C40F'  // 金黄
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export function EnemySystem({ characterRef, bulletHitPosition }: EnemySystemProps) {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const lastSpawnTime = useRef(0);
  const enemyIdCounter = useRef(0);
  const { camera } = useThree();

  // 在摄像机前方随机位置生成敌人
  const spawnEnemy = () => {
    // 获取摄像机前方向量
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    // 计算生成位置
    const spawnPosition = new THREE.Vector3();
    camera.getWorldPosition(spawnPosition);
    
    // 在摄像机前方添加随机偏移
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * 10,
      0,
      (Math.random() - 0.5) * 10
    );

    spawnPosition.add(
      cameraDirection
        .multiplyScalar(SPAWN_DISTANCE)
        .add(randomOffset)
    );
    spawnPosition.y = ENEMY_SIZE; // 设置高度

    // 创建新敌人
    const newEnemy: Enemy = {
      id: enemyIdCounter.current++,
      position: spawnPosition,
      color: getRandomColor() // 为每个敌人分配随机颜色
    };

    setEnemies(prev => [...prev, newEnemy]);
  };

  // 检查子弹碰撞
  useEffect(() => {
    if (bulletHitPosition) {
      setEnemies(prev => {
        return prev.filter(enemy => {
          const distance = enemy.position.distanceTo(bulletHitPosition);
          return distance > ENEMY_SIZE + 1; // 增加碰撞检测范围
        });
      });
    }
  }, [bulletHitPosition]); // 只在 bulletHitPosition 改变时触发

  useFrame(() => {
    if (!characterRef.current) return;

    const currentTime = Date.now();
    const characterPosition = characterRef.current.translation();
    const characterPos = new THREE.Vector3(
      characterPosition.x,
      characterPosition.y,
      characterPosition.z
    );

    // 生成新敌人
    if (currentTime - lastSpawnTime.current > SPAWN_INTERVAL) {
      spawnEnemy();
      lastSpawnTime.current = currentTime;
    }

    // 更新敌人位置
    setEnemies(prev => prev.filter(enemy => {
      const distanceToCharacter = enemy.position.distanceTo(characterPos);

      // 检查是否需要移除敌人（超出范围或碰到角色）
      if (distanceToCharacter > DESPAWN_DISTANCE || 
          distanceToCharacter < COLLISION_DISTANCE) {
        return false;
      }

      // 更新敌人位置
      const direction = new THREE.Vector3()
        .subVectors(characterPos, enemy.position)
        .normalize();

      enemy.position.add(
        direction.multiplyScalar(ENEMY_SPEED * 0.016)
      );

      return true;
    }));
  });

  return (
    <group>
      {enemies.map(enemy => (
        <RigidBody
          key={enemy.id}
          type="dynamic"
          position={[enemy.position.x, enemy.position.y, enemy.position.z]}
          colliders="ball"
        >
          <mesh castShadow>
            <sphereGeometry args={[ENEMY_SIZE, 16, 16]} />
            <meshStandardMaterial 
              color={enemy.color}
              metalness={0.3}
              roughness={0.7}
            />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
} 