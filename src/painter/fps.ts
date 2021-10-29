import Rect from '../shapes/Rect';
import Text from '../shapes/Text';

export const fpsRect = new Rect({
  display: false,
  x: 0,
  y: 0,
  width: 88,
  height: 40,
  fill: '#000000',
});

export const fpsText = new Text({
  display: false,
  x: 8,
  y: 6,
  fill: '#ffffff',
  fontSize: 24,
  fontWeight: 'bold',
  textBaseline: 'top',
});
