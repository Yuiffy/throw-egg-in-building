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
      // ????????????
      if (eggCount <= 1 && selectFloor > safeFloor + 1) {
        // ???????????????????????????
        eggConfirm(true, selectFloor);
      } else if (selectFloor - safeFloor - 1 + testTime + 1 > 14) {
        // ??????????????????????????????
        eggConfirm(true, selectFloor);
      } else if (eggCount > 1 && dangerFloor - selectFloor - 1 <= selectFloor - safeFloor) {
        // ?????????????????????????????????????????????????????????90->95????????????95??????????????????????????????99??????????????????100????????????????????????????????????????????????????????????14????????????101-95 - 1 <= 95-90????????????????????????
        eggConfirm(true, selectFloor);
      } else {
        // ???????????????????????????
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
              label="????????????"
              rules={[
                { required: true },
                { type: 'number', min: 1, max: 100 }
              ]}
            >
              <InputNumber style={{ width: 80 }} ref={inputNumberRef} />
            </Form.Item>
            <Button type="primary" htmlType="submit" disabled={gameState}>???</Button>
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

      <div>???????????????{eggCount}</div>
      <div>???????????????{testTime}</div>
      {gameState !== GAME_STATE.playing && <div>
        {gameState === GAME_STATE.overSuccess ? '?????????????????????????????????' : '????????????????????????????????????????????????????????????????????????????????????'}
      </div>}
      <div>???????????????
        <div ref={logRef} style={{
          maxHeight: 200,
          fontSize: 16,
          'overflow-y': 'scroll',
        }}>{log.reverse().map(({ broken, floor }, idx) => {
          return <div key={idx}>{`${floor}?????????${broken ? '??????' : '??????'}`}</div>
        })}</div>
      </div>
    </div>
  );
}

export default EggPlay;
