const acfParser = {};

function parseKV(text) {
  const input = text.split(/\t/g);

  const filtered = input.filter(v => {
    return v !== ''
  });

  const obj = {};
  obj[filtered[0]] = filtered[1];
  return obj
}

acfParser.decode = function decode(text) {
  text = text.replace(/"([^"]+(?="))"/g, '$1');

  const result = {};
  const lines = text.split(/[\r]?\n/g);
  let stack = [];
  let currentKey;
  let parentNode = {};
  let currentNode = {};

  for (let i = 0; i < lines.length; i++) {

    if (lines[i + 1] === '') break

    let nextLine = lines[i + 1].replace(/\t/g, '');

    // 入栈
    if (nextLine === '{') {
      // 推送新节点到当前节点，并设置为当前节点
      currentKey = lines[i].replace(/\t/g, '');

      if (Object.keys(parentNode).length === 0) {
        parentNode = result;
        stack.push(parentNode);
      } else {
        stack.push(currentNode);
        parentNode = currentNode;
      }
      parentNode[currentKey] = {};
      currentNode = parentNode[currentKey];
    }

    let formatted = lines[i].replace(/\t/g, '');
    if (formatted !== '{' && formatted !== '}' && formatted !== currentKey) {
      let obj = parseKV(lines[i]);
      let key = Object.keys(obj)[0];
      currentNode[key] = obj[key];
    }

    // 出栈
    if (nextLine === '}') {
      // 弹出当前节点 并 设置父节点为当前
      currentNode = stack.pop();
    }
  }

  return result
};

function getTab(number) {

  let result = '';
  for (let i = 0; i < number; i++) {
    result += `\t`;
  }
  return result
}

acfParser.encode = function encode(obj) {

  let result = '';

  function encode(obj, indent = 0) {

    for (const [key, value] of Object.entries(obj)) {

      if (typeof value === 'object') {
        result = result + `${getTab(indent)}"${key}"\n${getTab(indent)}{\n`;
        typeof value[Object.keys(value)[0]];
        encode(value, indent + 1);
        result = result + `${getTab(indent)}}\n`;
      }

      if (typeof value === 'string') {
        result = result + `${getTab(indent)}"${key}"${getTab(2)}"${value}"\n`;
      }
    }
  }

  encode(obj, 0);
  return result
};
var main = acfParser;

export { main as default };
