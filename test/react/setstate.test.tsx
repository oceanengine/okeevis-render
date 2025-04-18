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

const Context = createContext({});

const Child = memo((props: any) => {
  const [value, setValue] = useState(1);
  const ctx = useContext(Context);
  console.log('child render ctx', ctx);

  return (
      <Text
        x={200}
        y={150}
        fill="red"
        color="yellow"
        transitionDelay={0}
        transitionProperty="all"
        transitionDuration={600}
        transitionEase="cubic-bezier(0.42, 0.0, 0.58, 1.0)"
        fontSize={100}
        hoverStyle={{
          fontSize: 200,
        }}
        activeStyle={{
          fill: 'blue',
        }}
      >
        {ctx}
      </Text>
  );
});

const App = () => {
  const [value, setValue] = useState(1);
  console.log('app render');
  return (
    <Context.Provider value={value}>

    <Group >
      <Text x={100} y={100} fill="red" fontSize={24}>
        {value}
      </Text>
      <Child value={1} />
      <Rect
        x={100}
        onClick={() => setValue(2)}
        y={200}
        width={100}
        height={100}
        fill="#fff"
        activeStyle={{
          fill: 'blue',
        }}
        lineWidth={1}
        shadowColor="red"
        shadowBlur={4}
        shadowOffsetX={4}
        shadowOffsetY={4}
        transitionProperty={'all'}
        transitionDuration={1000}
        originX={'center'}
        originY={'center'}
      />
    </Group>
    </Context.Provider>
  );
};

app.render(<App />);
