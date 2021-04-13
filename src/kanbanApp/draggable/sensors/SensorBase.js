// 传感器BaseClass    鼠标事件 | 手势

export default class Sensor {
  constructor(containers = [], options = {}) {
    // 当前可拖拽的containers =>  HTMLElement
    this.containers = [...containers];
    // 缓存option
    this.options = {
      distance: 10, // 最小拖动距离
      ...options,
    };

    // 当前传感器是否在拖拽状态
    this.dragging = false;
    // 当前传感器所在的container
    this.currentContainer = null;
    // 当前拖拽的元素
    this.originalSource = null;
    // 缓存传感器按下的事件 => mouseDown.event
    this.startEvent = null;
  }

  // 传感器挂载
  apply() {
    return this;
  }

  // 传感器分离
  detach() {
    return this;
  }

  trigger(element, sensorEvent) {
    // document.createEvent已经被废弃使用新的Event API
    const event = new Event(sensorEvent.type, {
      bubbles: true,
      cancelable: true,
    });
    event.detail = sensorEvent;
    element.dispatchEvent(event);
    this.lastEvent = sensorEvent;
    return sensorEvent;
  }
}
