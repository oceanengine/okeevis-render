// vbox hbox span image <hr />  <spacer />
interface ParseOption {
  onclosetag(): void;
  onopentag(name: string, attribs: {
    [s: string]: string;
  }): void;
  ontext(data: string): void;
}

const enum State {
  Text = 0,
  BeforeTagName, // After <
  InTagName,
  InSelfClosingTag, // <br />
  BeforeClosingTagName, // </ div>
  InClosingTagName,
  AfterClosingTagName, // After >

  // Attributes
  BeforeAttributeName,
  InAttributeName,
  AfterAttributeName,
  BeforeAttributeValue,
  InAttributeValueDq, // "
  InAttributeValueSq, // '
  InAttributeValueNq,
}
// const stateMap = ['text', 'beforetagname', 'inTagName', 'InSelfClosingTag', 'BeforeClosingTagName', 'InClosingTagName', 'AfterClosingTagName', 'BeforeAttributeName', 'InAttributeName', 'AfterAttributeName', 'BeforeAttributeValue', 'InAttributeValueDq', 'InAttributeValueSq', 'InAttributeValueNq']

const allowTags = ['hbox', 'vbox', 'span', 'image', 'hr', 'spacer'];

export function parseXML(input: string, option: ParseOption) {
  const xml = input.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  let state = State.Text;
  let text = '';
  let tagName = '';
  let attributes: Record<string, string> = {};
  let attrName = '';
  let attrValue = '';
  let index = 0;
  // let textStart = 0;
  for (let i = 0; i < xml.length; i++) {
    index = i;
    const char = xml[i];
    const isEnd = i === xml.length - 1;
    if (state === State.Text) {
      stateText(char);
    } else if (state === State.BeforeTagName) {
      stateBeforeTagName(char);
    } else if (state === State.InTagName) {
      stateInTagName(char);
    } else if (state === State.InSelfClosingTag) {
      stateInSelfClosingTag(char);
    } else if (state === State.BeforeClosingTagName) {
      stateBeforeClosingTagName(char);
    } else if (state === State.InClosingTagName) {
      stateInClosingTagName(char);
    } else if (state === State.AfterClosingTagName) {
      stateAfterAttributeName(char);
    } else if (state === State.BeforeAttributeName) {
      stateBeforeAttributeName(char);
    } else if (state === State.InAttributeName) {
      stateInAttributeName(char);
    } else if (state === State.AfterAttributeName) {
      stateAfterAttributeName(char);
    } else if (state === State.BeforeAttributeValue) {
      stateBeforeAttributeValue(char);
    } else if (state === State.InAttributeValueDq) {
      stateInAttributeValueDq(char);
    } else if (state === State.InAttributeValueSq) {
      stateInAttributeValueSq(char);
    } else if (state === State.InAttributeValueNq) {
      stateInAttributeValueNq(char);
    }
    if (isEnd && state === State.Text) {
      onText()
    }
  }

  function stateText(c: string) { // initialState, after >
    if (c === '<') {
      const nextWord = xml.slice(index + 1, index + 7).toLowerCase();
      const matchTag = allowTags.some(tag => nextWord.indexOf(tag) === 0);
      if (matchTag || xml[index + 1] === '/') {
        state = State.BeforeTagName;
        tagName = '';
        onText();
        text = '';
      } else {
        text += c;
      }
    } else {
      text += c;
    }
  }

  function onText() {
    const trimText = text.trim();
    if (trimText) {
      option.ontext(trimText);
    }
  }

  function stateBeforeTagName(c: string) { // after <
    state = State.InTagName;
    if (c === '/') {
      state = State.BeforeClosingTagName;
    } else if (!/\s/.test(c)) {
      state = State.InTagName;
      tagName = c;
    }
  }

  function stateInTagName(c: string) { // < div
    if (c === '>') {
      afterOpenTag();
    } else if (/\s/.test(c)) {
      state = State.BeforeAttributeName;
    } else {
      tagName += c;
    }
  }
  function stateInSelfClosingTag(c: string) { // </ after </
    if (c === '>') {
      afterOpenTag();
      option.onclosetag();
    }
  }
  function stateBeforeClosingTagName(c: string) { // after  </ 
    if (c === '>') {
      state = State.Text;
      text = '';
      option.onclosetag()
    }
  }
  function stateInClosingTagName(c: string) {  // </ di
    if (c === '>') {
      state = State.Text;
      text = '';
      option.onclosetag();
    }
  }
  // function stateAfterClosingTagName(c: string) { //  </ div>  <br />
  //   if (c ==== '>') {

  //   }

  // }
  function stateBeforeAttributeName(c: string) { // <div  or   <div a="a" 
    if (c === '/') {
      state = State.InSelfClosingTag;
    } else if (c === '>') {
      afterOpenTag();
    } else if (!(/\s/.test(c))) {
      state = State.InAttributeName;
      attrName = c;
    }
  }
  function stateInAttributeName(c: string) {  // <div abbbbbb
    if (c === '=') {
      state = State.BeforeAttributeValue;
      attrValue = '';
    } else if (isWhiteSpace(c)) {
      state = State.AfterAttributeName;
    } else {
      attrName += c;
    }
  }
  function stateAfterAttributeName(c: string) { // <div aaaaaa=
    if (c === '=') {
      state = State.BeforeAttributeValue;
    } else if (!isWhiteSpace(c)) {
      state = State.InAttributeName;
      attrName = 'c';
    }
  }
  function stateBeforeAttributeValue(c: string) { // <div a=
    if (c === '"') {
      state = State.InAttributeValueDq;
    } else if (c === "'") {
      state = State.InAttributeValueSq;

    } else if (!isWhiteSpace(c)) {
      state = State.InAttributeValueNq;
      attrValue = c;
    }
  }
  function stateInAttributeValueDq(c: string) { // <div a="
    if (c === '"') {
      saveAttrValue();
    } else {
      attrValue += c;
    }
  }
  function stateInAttributeValueSq(c: string) { // <div a='
    if (c === "'") {
      saveAttrValue();
    } else {
      attrValue += c;
    }
  }
  function stateInAttributeValueNq(c: string) { // div a=b
    if (isWhiteSpace(c)) {
      saveAttrValue();
    } else {
      attrValue += c;
    }
  }

  function saveAttrValue() {
    attributes[attrName] = attrValue;
    state = State.BeforeAttributeName;
  }

  function afterOpenTag() {
    option.onopentag(tagName.toLowerCase(), attributes);
    attributes = {};
    state = State.Text;
    text = '';
  }

  function isWhiteSpace(c: string) {
    return /\s/.test(c);
  }
}