import {
  Input,
  Button,
  Col,
  Row,
  Select,
  InputNumber,
  DatePicker,
  AutoComplete,
  Cascader,
  Tooltip, Form, Space,
} from 'antd';
import { useEffect, useRef, useState } from "react";

const GAME_STATE = {
  playing: 0,
  overSuccess: 1,
  overFailed: 2,
};

function EggPlay({ onOver }) {
  const [form] = Form.useForm();
  const [eggCount, setEggCount] = useState(2);
  const [testTime, setTestTime] = useState(0);
  const [safeFloor, setSafeFloor] = useState(0);
  const [dangerFloor, setDangerFloor] = useState(101);
  const [gameState, setGameState] = useState(GAME_STATE.playing);
  const [log, setLog] = useState([]);
  const logRef = useRef();
  const inputNumberRef = useRef();
  const reset = () => {
    setEggCount(2);
    setTestTime(0);
    setSafeFloor(0);
    setDangerFloor(101);
    setGameState(GAME_STATE.playing);
    setLog([]);
    setPrev(GAME_STATE.playing);
    form.resetFields();
  }

  const gameOver = (success) => {
    setGameState(success ? GAME_STATE.overSuccess : GAME_STATE.overFailed);
  }

  const [prev, setPrev] = useState(gameState);
  useEffect(() => {
    if (prev === GAME_STATE.playing && gameState !== GAME_STATE.playing) {
      onOver && onOver(gameState === GAME_STATE.overSuccess ? true : false, testTime);
    }
    setPrev(gameState);
  }, [gameState])

  const brokenEgg = (floor) => {
    const danger = Math.min(floor, dangerFloor);
    const newEggCount = eggCount - 1;
    setEggCount(newEggCount);
    setDangerFloor(danger);
    if (danger === safeFloor + 1) {
      gameOver(true);
    } else if (newEggCount === 0) {
      gameOver(false);
    }
  }

  const safeEgg = (floor) => {
    const safe = Math.max(floor, safeFloor);
    setSafeFloor(safe);
    if (safe === dangerFloor - 1) {
      gameOver(true);
    }
  }

  const eggConfirm = (broken, floor) => {
    setTestTime((time) => time + 1);
    setLog((log) => [...log, ({ broken, floor })]);
    if (broken) brokenEgg(floor);
    else safeEgg(floor);
  }

  const onFinish = (values) => {
    const { selectFloor } = values;
    console.log('onFinish', values, selectFloor);
    if (selectFloor >= dangerFloor) eggConfirm(true, selectFloor);
    else if (selectFloor <= safeFloor) eggConfirm(false, selectFloor);
    else if (safeFloor === dangerFloor - 2 && selectFloor === dangerFloor - 1) eggConfirm(true, selectFloor)
    else {
      // 还有空间
      if (eggCount <= 1 && selectFloor > safeFloor + 1) {
        // 没蛋了还浪，让它碎
        eggConfirm(true, selectFloor);
      } else if (selectFloor - safeFloor - 1 + testTime + 1 > 14) {
        // 扔的步子太大，让它碎
        eggConfirm(true, selectFloor);
      } else if (eggCount > 1 && dangerFloor - selectFloor - 1 <= selectFloor - safeFloor) {
        // 后面的比前面的还少了，不如碎了吧。比如90->95的时候，95不碎的话后面本来要投99，但是一共就100，两个蛋很容易就用少次数解决了，不会到达14，所以当101-95 - 1 <= 95-90的时候就该碎碎了
        eggConfirm(true, selectFloor);
      } else {
        // 步子小，就先不碎吧
        eggConfirm(false, selectFloor);
      }
    }

    form.resetFields(['selectFloor']);
    inputNumberRef.current.focus();
    // logRef.scrollTop = logRef.scrollHeight;
  }
  const onFinishFailed = (b) => {
    console.log('onFinishFailed', b);
  }
  return (
    <div className="egg-play">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item>
          <Input.Group compact>
            <Form.Item
              noStyle
              name="selectFloor"
              label="选择楼层"
              rules={[
                { required: true },
                { type: 'number', min: 1, max: 100 }
              ]}
            >
              <InputNumber style={{ width: 80 }} ref={inputNumberRef} />
            </Form.Item>
            <Button type="primary" htmlType="submit" disabled={gameState}>扔</Button>
          </Input.Group>
        </Form.Item>
        {gameState !== GAME_STATE.playing && <Form.Item>
          <Space>
            <Button type="primary" onClick={reset}>
              Reset
            </Button>
            {/*<Button htmlType="button">*/}
            {/*  Fill*/}
            {/*</Button>*/}
          </Space>
        </Form.Item>}
      </Form>

      <div>剩余鸡蛋：{eggCount}</div>
      <div>尝试次数：{testTime}</div>
      {gameState !== GAME_STATE.playing && <div>
        {gameState === GAME_STATE.overSuccess ? '成功了，你测好了鸡蛋！' : '失败了，你鸡蛋都用完了还没测出鸡蛋从哪楼掉下去正好会烂掉'}
      </div>}
      <div>历史记录：
        <div ref={logRef} style={{
          maxHeight: 200,
          fontSize: 16,
          'overflow-y': 'scroll',
        }}>{[...log].reverse().map(({ broken, floor }, idx) => {
          return <div key={idx}>{`${floor}楼扔，${broken ? '碎了' : '安全'}`}</div>
        })}</div>
      </div>
    </div>
  );
}

export default EggPlay;
