import * as matrix from 'gl-matrix';


declare global {
    export type mat3 = matrix.mat3;
    export type mat2 = matrix.mat2;
    
    // https://developers.weixin.qq.com/miniprogram/dev/api/canvas/CanvasContext.setFillStyle.html
    export interface CanvasRenderingContext2D extends CanvasRenderingContext2D {
        setFillStyle(fill: string | CanvasGradient | CanvasPattern): void;
        setFontSize(fontSize: number): void;
        setGlobalAlpha(alpha: number): void;
        setLineCap(lineCap: string): void;
        setLineJoin(lineJoin: string): void;
        setMiterLimit(miterLimit: number): void;
        setShadow(offsetX: number, offsetY: number, blur: number, color: string): void;
        setStrokeStyle(stroke: string | CanvasGradient | CanvasPattern | CanvasPattern): void;
        setTextAlign(textAlign: string): void;
        setTextBaseline(textBaseline: string): void;
        draw(reverse?: boolean, callback?: Function): void;
    }
}
declare module 'lodash/_root'
