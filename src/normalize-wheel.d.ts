export interface NormalLizeWheel {
  spinX: number;
  spinY: number;
  pixelX: number;
  pixelY: number;
}
export default function(event: WheelEvent): NormalLizeWheel;