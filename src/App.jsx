import "./App.css";
import Blocks from "./blocks";

interface BlockReturn
{
	placed?:any;
	chopped?:any;
	plane: 'x' | 'y' | 'z';
	direction: number;
	bonus?: boolean;
}

function App() {

  // useEffect(() => {

  // },[])
  return (
    <div>
      {/* <meta name="viewport" content="width=device-width,user-scalable=no"> */}

      {/* <div id="container">
        <div id="game"></div>
        <div id="score">0</div>
        <div id="instructions">
          Click (or press the spacebar) to place the block
        </div>
        <div className="game-over">
          <h2>Game Over</h2>
          <p>You did great, you're the best.</p>
          <p>Click or spacebar to start again</p>
        </div>
        <div className="game-ready">
          <div id="start-button">Start</div>
          <div></div>
        </div>
      </div> */}
      <Blocks />
    </div>
  );
}

export default App;
