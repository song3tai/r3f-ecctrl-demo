import { useEffect, useState } from "react";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface GridCell {
  x: number;  // 网格单元的X坐标
  z: number;  // 网格单元的Z坐标
}

interface InfiniteGroundProps {
  characterRef: React.MutableRefObject<any>;  // 角色引用，用于获取位置
}

const CELL_SIZE = 20;  // 每个地板块的大小
const GRID_SIZE = 7;   // 视野范围（7x7的网格）
const GENERATION_THRESHOLD = CELL_SIZE * 0.7;  // 触发生成新地板的阈值

export function InfiniteGround({ characterRef }: InfiniteGroundProps) {
  const [cells, setCells] = useState<GridCell[]>([]);
  const [lastPosition, setLastPosition] = useState(new THREE.Vector3());

  // 计算当前角色所在的网格坐标
  const getCurrentCell = (position: THREE.Vector3): GridCell => ({
    x: Math.floor(position.x / CELL_SIZE),
    z: Math.floor(position.z / CELL_SIZE)
  });

  // 生成指定位置周围的地板块
  const generateCellsAroundPosition = (position: THREE.Vector3) => {
    const currentCell = getCurrentCell(position);
    const newCells: GridCell[] = [];
    const offset = Math.floor(GRID_SIZE / 2);

    for (let x = -offset; x <= offset; x++) {
      for (let z = -offset; z <= offset; z++) {
        newCells.push({
          x: currentCell.x + x,
          z: currentCell.z + z
        });
      }
    }
    return newCells;
  };

  // 预测角色的移动方向并生成前方的地板
  const generateForwardCells = (currentPos: THREE.Vector3, lastPos: THREE.Vector3) => {
    const direction = new THREE.Vector3()
      .subVectors(currentPos, lastPos)
      .normalize();
    
    // 计算前方的预测位置
    const predictedPosition = currentPos.clone().add(
      direction.multiplyScalar(CELL_SIZE * 2)
    );
    
    return generateCellsAroundPosition(predictedPosition);
  };

  // 合并现有地板和新生成的地板，去重
  const mergeCells = (existingCells: GridCell[], newCells: GridCell[]) => {
    const cellMap = new Map<string, GridCell>();
    
    [...existingCells, ...newCells].forEach(cell => {
      const key = `${cell.x},${cell.z}`;
      cellMap.set(key, cell);
    });
    
    return Array.from(cellMap.values());
  };

  useFrame(() => {
    if (!characterRef.current) return;
    
    const position = characterRef.current.translation();
    if (!position) return;

    const currentPosition = new THREE.Vector3(position.x, 0, position.z);
    
    // 检查角色是否移动了足够的距离
    if (currentPosition.distanceTo(lastPosition) > GENERATION_THRESHOLD) {
      // 生成当前位置周围的地板
      const currentCells = generateCellsAroundPosition(currentPosition);
      
      // 生成前方的地板
      const forwardCells = generateForwardCells(currentPosition, lastPosition);
      
      // 合并并更新地板
      const newCells = mergeCells(currentCells, forwardCells);
      setCells(newCells);
      
      // 更新最后的位置
      setLastPosition(currentPosition);
    }
  });

  // 初始化地板
  useEffect(() => {
    if (characterRef.current) {
      const position = characterRef.current.translation();
      const initialPosition = new THREE.Vector3(position.x, 0, position.z);
      const initialCells = generateCellsAroundPosition(initialPosition);
      setCells(initialCells);
      setLastPosition(initialPosition);
    }
  }, []);

  return (
    <group>
      {cells.map((cell) => (
        <RigidBody
          type="fixed"
          key={`${cell.x}-${cell.z}`}
          position={[cell.x * CELL_SIZE, -0.1, cell.z * CELL_SIZE]}>
          <mesh receiveShadow>
            <boxGeometry args={[CELL_SIZE - 0.1, 0.2, CELL_SIZE - 0.1]} />
            <meshStandardMaterial 
              color="#8B7355"
              metalness={0}
              roughness={1}
            />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
} 