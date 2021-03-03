import SVGNode from '../abstract/Node';

let id = 1;

export default class Shadow {
  public id: string;

  public shadowColor: string;

  public shadowBlur: number;

  public shadowOffsetX: number;

  public shadowOffsetY: number;

  public constructor() {
    this.id = 'light-render-shadow-' + id++;
  }

  public setShadow(
    shadowColor: string,
    shadowBlur: number,
    shadowOffsetX: number,
    shadowOffsetY: number,
  ) {
    this.shadowColor = shadowColor;
    this.shadowBlur = shadowBlur || 0;
    this.shadowOffsetX = shadowOffsetX || 0;
    this.shadowOffsetY = shadowOffsetY || 0;
  }

  public getSVGNode(): SVGNode {
    return {
      svgTagName: 'filter',
      svgAttr: {
        id: this.id,
        x: '-100%',
        y: '-100%',
        width: '300%',
        height: '300%'
      },
      childNodes: [
        {
          svgTagName: 'feDropShadow',
          svgAttr: {
            dx: this.shadowOffsetX,
            dy: this.shadowOffsetY,
            'flood-color': this.shadowColor,
            stdDeviation: this.shadowBlur / 2 + ' ' + this.shadowBlur / 2,
          },
        },
      ],
    };
  }
}
