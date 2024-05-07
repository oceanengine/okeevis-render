import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  createContext,
  createPortal,
  memo,
} from '../src/react';
import { Render, Group, Rect, Line, Text } from '../src';
import { useContext, useReducer } from '../src/react/hooks';

const dom = document.getElementById('root') as HTMLDivElement;

const render = new Render(dom, { workerEnabled: true });

const Context = createContext(3);

const portalCotainer = new Group();

const fn = (props: {value: number}) => <Rect x={props.value} y={400} width={100} height={100} stroke="red" lineWidth={1} />
const MemoFn = memo(fn);


const Component = (props: { x: number }) => {
  const [state, setState] = useState(1);
  const [value, setValue] = useState(1);
  const contextValue = useContext(Context);
  const refValue = useRef(value);
  console.log('context-value', contextValue);
  const callback = useCallback(() => {
    console.log('callback ', value);
  }, [value]);
  callback();
  console.log('refValue', refValue);
  const memoValue = useMemo(() => {
    return 100 + value;
  }, []);
  console.log('memovalue', memoValue);
  useEffect(() => {
    setTimeout(() => {
      setValue(3);
    }, 1000);
    return () => {
      console.log('effect clear');
    };
  }, []);
  return <Line x1={props.x} y1={0} x2={state * 100} y2={value * 100} lineWidth={3} stroke="blue" />;
};
Component.displayName = 'Component';

const MyGroup = (props: { a: number; b: number }) => {
  const [time, setTime] = useState(10);
  const contextValue = useContext(Context);
  console.log('root context value', contextValue);
  return (
    <>
      <Line  x1={0} y1={0} x2={100} y2={100} lineWidth={3} stroke="blue" />
      {true}
      {false}
      {null}
      {''}
      {'   dsdsf'}
      {{
        a: 3,
        b: 4,
      }}
      {[<Line x1={110} y1={0} x2={100} y2={100} lineWidth={3} stroke="red" />]}
      <Group fill="red" draggable>
        <Rect x={0} y={0} width={100} height={100} stroke="red" lineWidth={1} />
      </Group>
      <Context.Consumer>
        {(value: number) => (
          <Text
            x={300}
            y={300}
            draggable
            fill={time === 10 ? 'red' : 'blue'}
            fontSize={24 + time * 12}
            transitionProperty='all'
            onClick={() => {
              setTime(20);
            }}
          >
            {value}
          </Text>
        )}
      </Context.Consumer>
      {contextValue % 2 === 0 && <Component x={time} /> }
      {
        createPortal(<Rect x={100} y={150} width={100} height={100} fill={contextValue % 2 === 0 ? 'red' : 'blue'} lineWidth={1} />, portalCotainer, 'test')
      }
    </>
  );
};
MyGroup.displayName = 'MyGroup';

const App = () => {
  const [value, setValue] = useState(1);
  const reducer = useCallback((state: any, action: any) => {
    return {value: action.value as number};
  }, [])
  const [store, dispatch] = useReducer(reducer, {value: 3});
  const valueRef = useRef(value);
  valueRef.current = value;
  console.log('------', valueRef.current);
  useEffect(() => {
    setTimeout(() => {
      dispatch({
        type: 'test',
        value: 4
      })
    }, 1000);
    
  }, [])
  return (
    <Context.Provider value={store.value}>
      <MyGroup a={1} b={1} />
    </Context.Provider>
  );
};
render.add(portalCotainer);
render.add(<App />);
(window as any).render = render;
