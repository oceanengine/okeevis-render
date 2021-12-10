import parseXML from '../src/RichText/parser'

const drillDownIcon = './dd.png'
const lineClamp = 2;
const width = 100;
const str = ` <vbox align="center" pack="center">
        <hbox pack="center">
          <hbox align="start" padding="2 0 0 0"><image src=./dd.png width="16" height="16" /></hbox>
          <hbox ellipsis="..." lineClamp=2 padding="4" lineHeight="22" maxWidth=68></hbox>
        </hbox>
        <spacer height="4" />
        <span fontSize="12">部门人数</span>
        </vbox>`
const nodes = parseXML(str, {} as any)
console.log(str)
console.log(nodes)