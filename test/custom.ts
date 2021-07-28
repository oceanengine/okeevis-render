import Render from '../src/render'
import CustomeElement from '../src/shapes/CustomElement'
import Text from '../src/shapes/Text'
import Rect from '../src/shapes/Rect'

const dom = document.getElementById('root') as HTMLDivElement

const render = new Render(dom, {renderer: 'svg'})

class MyElement extends CustomeElement<{content?: string}> {

  protected get observedAttributes() {
    return ['content']
  }
  
  public getDefaultAttr(){
    return {
      ...super.getDefaultAttr(),
      fill: 'blue',
      content: 'hahaha',
      draggable: true,
    }
  }


  protected render() {
    const rect = new Rect({x: 0, y: 0, width: 100, height: 100, fill: '#f7f7f7'})
    const text = new Text({x: 10, y: 10, text: this.attr.content, fill: this.attr.fill})
    return [rect, text]
  }
}

const myElement = new MyElement();

(window as any).myElement = myElement

render.add(myElement)
