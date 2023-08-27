
export abstract class Curve {
    public abstract lineStart():void;
    public abstract lineEnd(): void;
    public abstract point(x: number, y: number): void;
}