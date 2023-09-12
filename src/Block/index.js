import React, { useEffect, useRef } from "react";
import { Box } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
const BLOCK_HEIGHT = 2.5;

const gameConstants = {
     STACK_ROTATION_SPEED: 0.004,
     SPAWN_OFFSET: 6,
     SPEED: 0.1,
     BLOCK_HEIGHT: BLOCK_HEIGHT,
     INITIAL_BLOCK_SIZE: [4, BLOCK_HEIGHT, 4],
     INITIAL_BLOCK_POS: { x: 0, y: 0, z: 0 },
     INITIAL_SCENE_POS_Y: -1
 }

const Block = ({
  args = [2, 0.4, 2],
  position = [0, 0, 0],
  active = false,
  i,
  spawnOffset,
  drop,
  setDrop,
  setLastBlockData,
  stack = [],
  gameOver,
  color,
  isTrimmedBit = false,
}) => {
  const mesh = useRef();
  let moveForward = true;
  let direction, directionInverted;

  //Adding new arguments on first render
  /////////////////////////////////////////
  useEffect(() => {
    mesh.current.args = args;
  }, []);

  //Controlling each individual block movement
  ///////////////////////////////////////////////
  useFrame(() => {
    direction = i % 2 === 0 ? "x" : "z";
    if (active && !gameOver) {
      directionInverted = i % 2 !== 0 ? "x" : "z";

      if (stack.length > 1)
        mesh.current.position[directionInverted] =
          stack[i - 1].pos[directionInverted];
      if (mesh.current.position[direction] <= -spawnOffset) moveForward = true;
      else if (mesh.current.position[direction] >= spawnOffset)
        moveForward = false;

      moveForward
        ? (mesh.current.position[direction] += gameConstants.SPEED)
        : (mesh.current.position[direction] -= gameConstants.SPEED);

      if (drop) {
        setLastBlockData({
          pos: mesh.current.position,
          args: mesh.current.args,
          direction,
        });
        setDrop(false);
      }
    }
    //Dropping the entire block if gameOver
    else if ((gameOver && i === stack.length - 1) || isTrimmedBit) {
      mesh.current.position.y -= gameConstants.SPEED * 2;
      mesh.current.rotation[direction] -= gameConstants.SPEED / 2;
    }
  });

  return (
    <mesh ref={mesh} position={position} rotation={[0, 0, 0]}>
      <Box args={args}>
        <meshStandardMaterial color={color} />
      </Box>
    </mesh>
  );
};

export default Block;
