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
render.showBBox = false;
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
        transitionEase="BounceOut"
        fontSize={100}
        hoverStyle={{
          fill: 'linear-gradient(red, blue)',
          fontSize: 200,
        }}
        activeStyle={{
          fill: 'currentColor',
        }}
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
    <Group
      onTransitionRun={e => console.log('run', e.propertyName)}
      onTransitionStart={e => console.log('start', e.propertyName)}
      onTransitionEnd={e => console.log('end', e.propertyName)}
    >
      <Text x={100} y={100} fill="red" fontSize={24}>
        {value}
      </Text>
      <Child setValue={setValue} />
      <Rect
        x={100}
        y={200}
        width={100}
        height={100}
        fill="#fff"
        lineWidth={1}
        shadowColor="red"
        shadowBlur={4}
        shadowOffsetX={4}
        shadowOffsetY={4}
        transitionProperty={'all'}
        transitionDuration={300}
        hoverStyle={{
          shadowBlur: 50
        }}
      />
    </Group>
  );
};

app.render(<App />);
