

export default class Render {
  private _dom: HTMLDivElement
  private _dpr: number;
  private _width: number;
  private _height: number;
  private _painter
  private _eventHandle
  private _animator
  private _renderer
  private _isBrowser: boolean;
  private _dirty: boolean;

  public constructor(dom: HTMLDivElement | HTMLCanvasElement) {
    this._dom = dom;
  }

  public resize(width: number, height: number) {

  }
  
  public updateAll() {

  }

  public add() {

  }

  public addAll() {

  }

  public remove() {

  }

  public getBase64() {

  }

  public downloadImage() {

    
  }

  public dispose() {
    
  }
  
}