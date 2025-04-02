import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  createContext,
  createPortal,
  createRoot,
  memo,
  useContext,
  ReactElement,
  useReducer,
} from '../../src/react';
import { Render, Group, Rect, Line, Text } from '../../src';

const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom, { renderer: 'canvas' });
render.enableDirtyRect = true;
render.showBBox = true;
render.showFPS = true;
const app = createRoot(render.getRoot());

const Child = (props: any) => {
  const [value, setValue] = useState(1);
  console.log('child render', value);

  return (
    <>
      <Text
        x={200}
        y={150}
        fill="red"
        color="yellow"
        transitionProperty="all"
        transitionDuration={1000}
        transitionEase='BounceOut'
        fontSize={100}
        hoverStyle={{
            fill: 'linear-gradient(red, blue)',
            fontSize: 200,
        }}
        activeStyle={{
          fill: 'currentColor',
        }}
        onTransitionEnd={e => console.log(e)}
        onClick={() => {
          setValue(2);
          props.setValue(2);
        }}
      >
        {value}
      </Text>
    </>
  );
};

const App = () => {
  const [value, setValue] = useState(1);
  console.log('app render');
  return (
    <>
      <Text x={100} y={100} fill="red" fontSize={24}>
        {value}
      </Text>
      <Child setValue={setValue} />
    </>
  );
};

app.render(<App />);
