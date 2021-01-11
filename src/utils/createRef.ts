import  Element, {Ref, } from '../shapes/Element';


export default function createRef<T extends Element = Element>(value?: T): Ref<T> {
  return {
    current: value
  }
}