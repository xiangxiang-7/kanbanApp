const matchFunction =
  Element.prototype.matches ||
  Element.prototype.webkitMatchesSelector ||
  Element.prototype.mozMatchesSelector ||
  Element.prototype.msMatchesSelector;

// 找到最近的节点
export function closest(element, value) {
  if (!element) {
    return null;
  }

  const selector = value;
  const callback = value;
  const nodeList = value;
  const singleElement = value;

  const isSelector = Boolean(typeof value === "string");
  const isFunction = Boolean(typeof value === "function");
  const isNodeList = Boolean(
    value instanceof NodeList || value instanceof Array,
  );
  const isElement = Boolean(value instanceof HTMLElement);

  function conditionFn(currentElement) {
    if (!currentElement) {
      return currentElement;
    }
    // 返回 current父节点 selector能选中
    if (isSelector) {
      return matchFunction.call(currentElement, selector);
      // 返回 current父节点 包含在nodeList中
    }
    if (isNodeList) {
      return [...nodeList].includes(currentElement);
      // 返回 current父节点===singleElement的
    }
    if (isElement) {
      return singleElement === currentElement;
      // 返回 current父节点 执行function能true
    }
    if (isFunction) {
      return callback(currentElement);
    }
    return null;
  }

  let current = element;

  // dowhile循环 找到最近匹配的父节点
  while (current && current !== document.body && current !== document) {
    if (conditionFn(current)) {
      return current;
    }
    current = current.parentNode;
  }

  return null;
}
//  两点间的直线距离
export function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export const debounceDuration = 100;
export function throttle(fn, delay = debounceDuration) {
  // 记录上次触发事件时间戳
  let previous = Date.now();

  return function (...args) {
    const now = Date.now();
    // 本次事件触发与上一次的时间比较
    const diff = now - previous - delay;

    // 如果隔间时间超过设定时间 执行函数
    if (diff >= 0) {
      // 更新时间
      previous = now;

      setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    }
  };
}
