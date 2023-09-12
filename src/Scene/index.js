import React, { useRef, Suspense, useState } from "react";
import { Physics } from "@react-three/cannon";
import {
  Text,
  Sparkles,
  OrbitControls,
  Billboard,
  Html,
} from "@react-three/drei";
// import { InfoCircleOutlined } from "@ant-design/icons";
// import { Button } from "antd"
import Stacks from "../Stacks";

const Scene = ({ gameOver, setGameOver, score, setScore, canvasRef }) => {
  const mesh = useRef();
  const [isPlaying, setIsPlaying] = useState(false);
  const [stack, setStack] = useState([]);

  //Helper function for getting gradient block colors based on the number of blocks
  ///////////////////////////////////////////////////////////////////////////////////
  const getColor = (index, darker = false) => {
    return `hsl(${index * 20}, ${darker ? "50%" : "100%"}, 80%)`;
  };

  //How to Play Banner text
  //////////////////////////////
  const HowToPlayBanner = ({ visible = true }) => {
    const onClick = () => {
      setGameOver(false);
      setIsPlaying(true);
    };

    return (
      <Html center style={{ zIndex: 0, important: true }}>
        <div
          style={{
            display: visible ? "block" : "none",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            color: "white",
            padding: "20px 50px",
            minWidth: "350px",
            borderRadius: "5px",
          }}
          className="how-to-play-component-container"
        >
          <div
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              padding: "20px 50px",
              minWidth: "350px",
              borderRadius: "5px",
            }}
          >
            <p
              style={{
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              {gameOver ? "Game Over" : "How To Play"}
            </p>
            <hr />
            <p>
              It's Easy. All you have to do is build the tallest block tower :D
            </p>
            <p>
              Use
              <span style={{ color: "cyan" }}> Mouse Click </span> |
              <span className="keys"> Spacebar </span> |
              <span className="keys"> Enter </span> |
              <span className="keys"> Up Arrow Key </span> |
              <span className="keys"> Down Arrow Key </span> | to drop blocks
            </p>
            <button
              style={{
                backgroundColor: "cyan",
                color: "black",
                fontWeight: "700",
              }}
              onClick={onClick}
            >
              {gameOver ? "Retry" : "Play"}
            </button>
          </div>
        </div>
      </Html>
    );
  };

  // Score text
  ////////////////
  const ScoreText = ({ color = "cyan" }) => {
    const mesh = useRef();
    return (
      <mesh ref={mesh}>
        <Text color={color} fontSize={0.1} position={[0, 1.7, 2]}>
          SCORE
        </Text>
        <Text color={color} fontSize={0.3} position={[0, 1.5, 2]}>
          {score}
        </Text>
      </mesh>
    );
  };

  return (
    <mesh ref={mesh}>
      <Suspense fallback={null}>
        <Physics>
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
            autoRotate={true}
            autoRotateSpeed={1}
            enableRotate={false}
          />
          <ambientLight intensity={0.3} />
          <spotLight position={[0, 10, 0]} angle={0.5} intensity={0.5} />
          <pointLight position={[0, -1, 2]} intensity={0.5} />
          <Sparkles scale={100} size={30} speed={2} noise={10} />
          <Sparkles scale={50} size={20} color={getColor(stack.length)} />
          <Billboard>
            <ScoreText />
            <HowToPlayBanner visible={!isPlaying} />
            <mesh
              rotation={[Math.PI / 5, -Math.PI / 5, 0]}
              position={[0, 1, -2]}
            >
              <Stacks
                setScore={setScore}
                canvasRef={canvasRef}
                setGameOver={setGameOver}
                gameOver={gameOver}
                stack={stack}
                setStack={setStack}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                getColor={getColor}
              />
            </mesh>
          </Billboard>
        </Physics>
      </Suspense>
    </mesh>
  );
};

export default Scene;
