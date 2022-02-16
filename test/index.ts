import SVGPainter from '../src/painter/SVGPainter'
import { registerPainter } from '../src/index';
registerPainter('svg', SVGPainter);

import './pattern.test'

