import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
// import "./styles.sass";

const Blocks = () => {
  const canvasRef = useRef();

  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (gameOver) {
      //You can update a leader-board DB from here
    }
  }, [gameOver]);

  return (
    <Canvas
      style={{
        height: "80vh",
        backgroundColor: "black",
        backgroundImage: "linear-gradient(to bottom, black, #003f59)",
        cursor: "pointer",
        maxWidth: "100%",
        minWidth: "400px",
        textAlign: "center",
        margin: "auto",
        WebkitUserSelect: "none",
        MsUserSelect: "none",
        userSelect: "none",
      }}
      ref={canvasRef}
    >
      <Scene
        gameOver={gameOver}
        setGameOver={setGameOver}
        score={score}
        setScore={setScore}
        canvasRef={canvasRef}
      />
    </Canvas>
  );
};

export default Blocks;
