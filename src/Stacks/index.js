import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react'
import _ from 'lodash'
import Block from '../Block';
// import { gameConstants } from '../constant';

const BLOCK_HEIGHT = 2.5;

export const gameConstants = {
    STACK_ROTATION_SPEED: 0.004,
    SPAWN_OFFSET: 6,
    SPEED: 0.1,
    BLOCK_HEIGHT: BLOCK_HEIGHT,
    INITIAL_BLOCK_SIZE: [4, BLOCK_HEIGHT, 4],
    INITIAL_BLOCK_POS: { x: 0, y: 0, z: 0 },
    INITIAL_SCENE_POS_Y: -1
}

const Stacks = ({
    setScore,
    canvasRef,
    setGameOver,
    gameOver,
    setStack,
    stack,
    isPlaying,
    setIsPlaying,
    getColor
}) => {

    //Stack component ref
    const mesh = useRef();
    //A ref to keep the gameOver state during state updates
    const gameOverRef = useRef(false);
    //Used to display a cool animation during gameOver state
    const moveUp = useRef(true);
    //The x,y,z value of the current active block
    const args = useRef(gameConstants.INITIAL_BLOCK_SIZE)

    //State for keeping trimmed bits (offsets when placing active blocks)
    const [trimmedBits, setTrimmedBits] = useState([]);
    //State for keeping track of the current ground pos (So the ground moves down with each block)
    const [currentGround, setCurrentGround] = useState(gameConstants.INITIAL_SCENE_POS_Y)
    //State for notifying when a block was dropped.
    const [drop, setDrop] = useState(false);
    //State for keeping the last block data (So we can trim the new blocks based on that)
    const [lastBlockData, setLastBlockData] = useState();

    //Temporary variables we are going to use inside loops
    let isCurrentBlock, initialPos, tempStack, lastX, lastZ, trimmedArgs = {};
    let tempOffsetX, tempOffsetZ, tempLastBlockData, tempLastLastBlockData, tempTrimmedBlock;
    let direction, size, delta, overhangSize, overlap;
    let trimmedBitShift, trimmedBitPosX, trimmedBitPosZ, trimmedBitX, trimmedBitZ, trimmedBitTempObject;

    useEffect(() => {
        canvasRef.current.addEventListener('click', onClick)
        document.addEventListener('keyup', ({ code }) => {
            if (code === "Space" || code === "ArrowUp" || code === "ArrowDown" || code === "Enter") {
                onClick()
            }
        })

        return () => {
            document.removeEventListener("click", onClick)
            document.removeEventListener("keyup", onClick)
        }
    }, []);

    //Triggering the block trim logic
    ////////////////////////////////////////
    useEffect(() => {
        if (lastBlockData && !drop && isPlaying || stack.length === 0 && isPlaying) {
            tempStack = stack;
            tempLastBlockData = lastBlockData;
            tempLastLastBlockData = stack.length > 1 ? stack[stack.length - 2] : {
                pos: gameConstants.INITIAL_BLOCK_POS,
                args: gameConstants.INITIAL_BLOCK_SIZE
            }
            if (lastBlockData) {
                tempTrimmedBlock = trimBlock(lastBlockData, tempLastLastBlockData);
                tempLastBlockData.args = tempTrimmedBlock.args;
                tempLastBlockData.pos.x += tempTrimmedBlock.tempOffsetX;
                tempLastBlockData.pos.z += tempTrimmedBlock.tempOffsetZ;
                tempLastBlockData.isDead = tempTrimmedBlock.isDead;
            }
            if (!gameOverRef.current && isPlaying) {
                tempStack[tempStack.length - 1] = tempLastBlockData;

                setStack(current => [...current, undefined]);
                setCurrentGround(current => current - gameConstants.BLOCK_HEIGHT);
            }
        }
    }, [drop, isPlaying, gameOverRef.current]);

    //Resetting values for a new game
    //////////////////////////////////////
    useEffect(() => {
        if (!gameOver) {
            setTrimmedBits([]);
            setStack([])
            setCurrentGround(gameConstants.INITIAL_SCENE_POS_Y);
            setDrop(false)
            setScore(0)
            args.current = gameConstants.INITIAL_BLOCK_SIZE
            gameOverRef.current = false;
        }
    }, [gameOver]);

    useFrame(() => {
        mesh.current.rotation.y += gameConstants.STACK_ROTATION_SPEED

        //Setting stack movement based on play
        if (!isPlaying) {
            if (mesh.current.position.y > stack.length * gameConstants.BLOCK_HEIGHT) moveUp.current = false;
            else if (mesh.current.position.y < 0-gameConstants.BLOCK_HEIGHT) moveUp.current = true;

            if (moveUp.current) mesh.current.position.y += gameConstants.STACK_ROTATION_SPEED * 10
            else mesh.current.position.y -= gameConstants.STACK_ROTATION_SPEED * 10
        }
        else if (mesh.current.position.y !== 0) mesh.current.position.y = 0
    });

    //Helper Function for trimming Blocks
    ////////////////////////////////////////////
    const trimBlock = (block, prevBlock) => {
        direction = block.direction;
        size = direction === "x" ? block.args[0] : block.args[2];
        delta = block.pos[direction] - prevBlock.pos[direction];
        overhangSize = Math.abs(delta);
        overlap = size - overhangSize;

        trimmedArgs.x = block.direction === "x" ? overlap : block.args[0];
        trimmedArgs.z = block.direction === "z" ? overlap : block.args[2];

        tempOffsetX = ((block.pos.x - prevBlock.pos.x) / -2)
        tempOffsetZ = ((block.pos.z - prevBlock.pos.z) / -2)

        //Game is over if overlap is less than 0
        if (overlap < 0 && !gameOverRef.current) {
            setGameOver(true)
            setIsPlaying(false);
            setLastBlockData(undefined);
            gameOverRef.current = true;

            return {
                args: [block.args[0], gameConstants.BLOCK_HEIGHT, block.args[2]],
                tempOffsetX: 0,
                tempOffsetZ: 0
            }
        }

        // Calculating Trimmed Bits
        trimmedBitShift = (overlap / 2 + overhangSize / 2) * Math.sign(delta);
        trimmedBitPosX = direction === "x" ? block.pos.x + trimmedBitShift : block.pos.x;
        trimmedBitPosZ = direction === "z" ? block.pos.z + trimmedBitShift : block.pos.z;
        trimmedBitX = direction === "x" ? overhangSize : block.args[0];
        trimmedBitZ = direction === "z" ? overhangSize : block.args[2];

        trimmedBitTempObject = {
            position: [trimmedBitPosX, gameConstants.INITIAL_SCENE_POS_Y, trimmedBitPosZ],
            args: [trimmedBitX, gameConstants.BLOCK_HEIGHT, trimmedBitZ],
        }

        setTrimmedBits(current => [...current, trimmedBitTempObject]);
        setScore(preScore => preScore + 1)

        return {
            args: [trimmedArgs.x, gameConstants.BLOCK_HEIGHT, trimmedArgs.z],
            tempOffsetX,
            tempOffsetZ
        }
    }

    //Start dropping a block on click
    ///////////////////////////////////
    const onClick = () => {
        setDrop(true)
    }

    //Display blocks
    const displayBlocks = stack.map((block, i) => {
        /**
         * NOTE:
         * 1) if block === undefined, this is the current active block
        */
        if (block) {
            args.current = block?.args;
            lastX = block?.pos.x;
            lastZ = block?.pos.z;
        }
        else {
            lastX = undefined;
            lastZ = undefined;
        }

        isCurrentBlock = i === (stack.length - 1);
        initialPos = i % 2 === 0 ?
            [lastX ? lastX : gameConstants.SPAWN_OFFSET, gameConstants.INITIAL_SCENE_POS_Y - ((stack.length - 1) - i) * gameConstants.BLOCK_HEIGHT, lastZ ? lastZ : 0] :
            [lastX ? lastX : 0, gameConstants.INITIAL_SCENE_POS_Y - ((stack.length - 1) - i) * gameConstants.BLOCK_HEIGHT, lastZ ? lastZ : -gameConstants.SPAWN_OFFSET]

        return <Block
            position={initialPos}
            args={args.current}
            active={isCurrentBlock}
            key={i}
            i={i}
            spawnOffset={gameConstants.SPAWN_OFFSET}
            drop={drop}
            setDrop={setDrop}
            setLastBlockData={setLastBlockData}
            stack={stack}
            gameOver={gameOver}
            color={getColor(i)}
        />
    })

    //Display falling trimmed block bits
    const displayTrimmedBits = trimmedBits.map((bit, i) => {
        return <Block
            position={bit.position}
            args={bit.args}
            key={i}
            i={i}
            isTrimmedBit
            color={getColor(i, true)}
        />
    })

    return (
        <mesh ref={mesh}>
            {displayBlocks}
            {displayTrimmedBits}
            <Block
                position={[0, currentGround, 0]}
                args={gameConstants.INITIAL_BLOCK_SIZE}
                currentGround={currentGround}
                gameOver={gameOver}
                isBase
                color={getColor(0)}
            />
        </mesh>
    )
}

export default Stacks;