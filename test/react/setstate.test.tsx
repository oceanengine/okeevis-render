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
      onTransitionCancel={e => console.log('cancel', e.propertyName)}
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
        animation={{
          keyframes: [{rotation: 0,}, {rotation: Math.PI * 2,}],
          duration: 3000,
          direction: 'alternate',
          iterations: Infinity,
        }}
        hoverStyle={{
          shadowBlur: 50,
          fill: 'green',
          animation: {
            keyframes: [{rotation: 0,}, {rotation: Math.PI * 2,}],
            duration: 1000,
            iterations: Infinity,
            direction: 'alternate',
            easing: 'linear'
          }
        }}
      />
    </Group>
  );
};

app.render(<App />);
