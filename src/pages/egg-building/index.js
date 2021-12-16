import introImage from './egg-building-intro.png';
import { useState } from "react";
import EggPlay from "./EggPlay";
import 'antd/dist/antd.css';

function Index() {
  const [playCount, setPlayCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [maxStep, setMaxStep] = useState(-1);
  const [sumStep, setSumStep] = useState(0);
  return (
    <div className="App">
      <header className="App-header">
        <img src={introImage} alt="logo" height={400} />
        <div
          // style={{width: 300}}
        >
          <div style={{ fontSize: 14, marginBottom: 40 }}>
            <div>总游玩局数：{playCount}</div>
            <div>总游玩成功局数：{successCount}</div>
            <div>最大步数：{maxStep === -1 ? '暂无' : maxStep}</div>
            <div>平均步数：{sumStep === 0 ? '暂无' : (sumStep / successCount)}</div>
          </div>
          <EggPlay
            onOver={(success, stepCount) => {
              console.log('onOver!', success, stepCount);
              setPlayCount((count) => count + 1);
              if (success) {
                setSuccessCount(count => count + 1);
                setMaxStep(max => Math.max(max, stepCount));
                setSumStep(value => value + stepCount)
              }
            }}
          />
        </div>
      </header>
    </div>
  );
}

export default Index;
