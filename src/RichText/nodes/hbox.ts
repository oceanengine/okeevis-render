/**
 * hbox
 */
import * as lodash from '../../utils/lodash';
import { getPercentOrNumberValue } from '../../utils/math';
import Box from './box';
import { flexLayout } from '../flexlayout';

export default class HBox extends Box {
  public type: string = 'hbox';

  public getContentSize(): [number, number] {
    this.children.forEach(child => child.computeSize());
    const contentWidth = lodash.sum(this.children.map(child => child.minSize[0]));
    const contentHeight = lodash.max(this.children.map(child => child.minSize[1])) || 0;
    return [contentWidth, contentHeight];
  }

  public layout(): void {
    const contentBox = this.getContentBox();

    this.children.forEach(child => {
      const propsWidth = child.props.width as number;
      const minWidth = child.minSize[0];
      let w: number;
      if (propsWidth) {
        w = getPercentOrNumberValue(propsWidth, contentBox.width);
      } else {
        w = minWidth;
      }
      child.bbox.width = w;
      if (lodash.isString(child.props.height)) {
        child.bbox.height = (parseFloat(child.props.height) / 100) * contentBox.height;
      } else {
        child.bbox.height = child.minSize[1];
      }
    });
    const contentWidth = lodash.sum(this.children.map(child => child.bbox.width));
    const leftWidth = contentBox.width - contentWidth;

    const flexItems = this.children.filter(child => child.props.flex > 0);
    const flexValues = flexItems.map(item => item.props.flex);
    const totalFlex = lodash.sum(flexValues);
    const flexGrow = flexValues.map(flex => (flex / totalFlex) * leftWidth);
    flexItems.forEach((item, index) => {
      item.bbox.width += flexGrow[index];
    });

    flexLayout(
      contentBox,
      this.children.map(child => child.bbox),
      'hbox',
      this.props.align,
      this.props.pack,
    );

    this.children.forEach(child => child.layout());
  }
}
