import * as matrix from 'gl-matrix';


declare global {
    interface Window {
        msRequestAnimationFrame: typeof requestAnimationFrame;
        mozRequestAnimationFrame: typeof requestAnimationFrame;
        oRequestAnimationFrame: typeof requestAnimationFrame;
        msCancelAnimationFrame: Function;
        mozCancelAnimationFrame: Function;
        oCancelAnimationFrame: Function;
    }
    export type mat3 = matrix.mat3;
    export type mat2 = matrix.mat2;
    
    // https://developers.weixin.qq.com/miniprogram/dev/api/canvas/CanvasContext.setFillStyle.html
    export interface CanvasRenderingContext2D extends CanvasRenderingContext2D {
        setFillStyle(fill: string | CanvasGradient | CanvasPattern): void;
        setFontSize(fontSize: number): void;
        setGlobalAlpha(alpha: number): void;
        setLineWidth(lineWidth: number): void;
        setLineCap(lineCap: string): void;
        setLineDash(lineDash: number[], offset?: number): void;
        setLineJoin(lineJoin: string): void;
        setMiterLimit(miterLimit: number): void;
        setShadow(offsetX: number, offsetY: number, blur: number, color: string): void;
        setStrokeStyle(stroke: string | CanvasGradient | CanvasPattern | CanvasPattern): void;
        setTextAlign(textAlign: string): void;
        setTextBaseline(textBaseline: string): void;
        createCircularGradient(cx: number, cy: number, r: number): CanvasGradient;
        draw(reverse?: boolean, callback?: Function): void;
    }
}