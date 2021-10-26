/**
 * hbox
 */
import * as lodash from '../../utils/lodash';
import { getPercentOrNumberValue } from '../../utils/math';
import Box from './box';
import { flexLayout } from '../flexlayout';

export default class VBox extends Box {
  public type: string = 'vbox';

  public getContentSize(): [number, number] {
    this.children.forEach(child => child.computeSize());
    const contentWidth = lodash.max(this.children.map(child => child.minSize[0])) || 0;
    const contentHeight = lodash.sum(this.children.map(child => child.minSize[1]));
    return [contentWidth, contentHeight];
  }

  public layout(): void {
    const contentBox = this.getContentBox();

    this.children.forEach(child => {
      const propsHeight = child.props.height as number;
      const minHeight = child.minSize[1];
      let h: number;
      if (propsHeight) {
        h = getPercentOrNumberValue(propsHeight, contentBox.height);
      } else {
        h = minHeight;
      }
      child.bbox.height = h;
      if (lodash.isString(child.props.width)) {
        child.bbox.width = (parseFloat(child.props.width) / 100) * contentBox.width;
      } else {
        child.bbox.width = child.minSize[0];
      }
    });

    const contentHeight = lodash.sum(this.children.map(child => child.bbox.height));
    const leftHeight = contentBox.height - contentHeight;

    const flexItems = this.children.filter(child => child.props.flex > 0);
    const flexValues = flexItems.map(item => item.props.flex);
    const totalFlex = lodash.sum(flexValues);
    const flexGrow = flexValues.map(flex => (flex / totalFlex) * leftHeight);
    flexItems.forEach((item, index) => {
      item.bbox.height += flexGrow[index];
    });

    flexLayout(
      contentBox,
      this.children.map(child => child.bbox),
      'vbox',
      this.props.align,
      this.props.pack,
    );

    this.children.forEach(child => child.layout());
  }
}
