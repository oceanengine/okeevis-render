import Group, { GroupConf } from './Group'
import Element from './Element';


class CustomElement extends Group {

  public get isGroup() {
    return true;
  }

  public $$CustomType: boolean = true;

  private _updated: boolean;

  public skipUpdate() {
    this._updated = true;
  }

  public forceUpdate() {
   this.update(); 
  }

  protected getObservedAttr(): string[] {
    return []
  }

  protected created() {
    if (!this._updated) {
      this.update();
    }
  }

  protected shouldUpdate() {
    return !this._updated;
  }

  protected update() {
    if (this.shouldUpdate()) {
      const renderObjs = this.render();
      this.clear();
      this.addAll(Array.isArray(renderObjs) ? renderObjs : [renderObjs].filter(item => item));
    }
    this._updated = true;
  }

  protected onAttrChange(key: any, value: any, oldValue: any) {
    super.onAttrChange(key, value, oldValue);
    if (this.getObservedAttr().indexOf(key) !== -1) {
      this._updated = false;
    }
  }

  protected render(): Element | Element[] {
    return null;
  }

}

declare class MyClass<T> extends Element<T & GroupConf> {
  public $$CustomType: boolean;

  public skipUpdate(): void;
  /**
   * 监听属性
   */
  protected getObservedAttr(): string[];
  /**
   * 是否更新
   */
  protected shouldUpdate(): boolean;
  /**
   * 渲染
   */
  protected render(): Element | Element[];

}

export type TypeCustomElement<T = {}> = MyClass<T>;

export default CustomElement as any as new <T>(attr?: T & GroupConf) => MyClass<T>;