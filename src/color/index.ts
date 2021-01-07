import Gradient from '../abstract/Gradient';
import LinearGradient from './LinearGradient';
import RadialGradient from './RadialGradient';
import Pattern from './Pattern';

export type ColorValue = string | LinearGradient | RadialGradient | Pattern;

export {
  Gradient,
  LinearGradient,
  RadialGradient,
  Pattern,
}