import { closest, distance as euclideanDistance, throttle } from "../../utils";
import SensorBase from "./SensorBase";
import {
  DragStartSensorEvent,
  DragMoveSensorEvent,
  DragStopSensorEvent,
} from "./SensorEvent";

// 使用Symbol存储事件key值 更方便addEventListener 和 removeEventListener
// 鼠标按下key
const onMouseDown = Symbol("onMouseDown");
// 鼠标移动key
const onMouseMove = Symbol("onMouseMove");
// 鼠标抬起key
const onMouseUp = Symbol("onMouseUp");
// 开始拖拽key
const startDrag = Symbol("startDrag");
// 拖拽距离移动key
const onDistanceChange = Symbol("onDistanceChange");

export default class MouseSensor extends SensorBase {
  constructor(containers = [], options = {}) {
    super(containers, options);

    this.pageX = null;
    this.pageY = null;

    this[onMouseDown] = this[onMouseDown].bind(this);
    this[onMouseMove] = throttle(this[onMouseMove]).bind(this);
    this[onMouseUp] = this[onMouseUp].bind(this);
    this[startDrag] = this[startDrag].bind(this);
    this[onDistanceChange] = this[onDistanceChange].bind(this);
  }

  apply() {
    document.addEventListener("mousedown", this[onMouseDown], true);
  }

  detach() {
    document.removeEventListener("mousedown", this[onMouseDown], true);
  }

  // 按下鼠标
  [onMouseDown](event) {
    console.log("触发onMouseDown");

    // 找到target最近的container
    const container = closest(event.target, this.containers);
    if (!container) {
      return;
    }

    // 找到最近的可拖拽的元素
    const originalSource = closest(event.target, this.options.draggable);
    if (!originalSource) {
      return;
    }

    const { pageX, pageY } = event;

    Object.assign(this, { pageX, pageY });
    this.startEvent = event;

    // 缓存container
    this.currentContainer = container;
    // 缓存拖拽元素
    this.originalSource = originalSource;

    // 根据拖拽距离判断是否能触发drag:move
    document.addEventListener("mouseup", this[onMouseUp]);
    document.addEventListener("dragstart", preventNativeDragStart);
    document.addEventListener("mousemove", this[onDistanceChange]);
  }

  // onDistanceChange判断是否进行拖拽 绑定onMosueMove事件
  [startDrag]() {
    // eslint-disable-next-line no-console
    console.log("触发startDrag");

    const { startEvent, originalSource, currentContainer } = this;
    // 创建type为drag:start的事件实例
    const dragStartEvent = new DragStartSensorEvent({
      clientX: startEvent.clientX,
      clientY: startEvent.clientY,
      target: startEvent.target,
      container: currentContainer,
      originalSource,
      originalEvent: startEvent,
    });

    // 当前container下触发dragStartEvent事件
    this.trigger(currentContainer, dragStartEvent);
    if (dragStartEvent.canceled()) {
      return;
    }

    this.dragging = true;
    document.addEventListener("mousemove", this[onMouseMove]);
  }

  // 开始拖拽的前置判断 挂载到mousemove上
  [onDistanceChange](event) {
    console.log("触发onDistanceChange");
    const { pageX, pageY } = event;
    const { distance } = this.options;
    const { startEvent } = this;

    Object.assign(this, { pageX, pageY });

    if (!this.currentContainer) {
      return;
    }

    // 计算onMouseDown和mousemove的直线距离
    // eslint-disable-next-line max-len
    const distanceMoveed =
      euclideanDistance(startEvent.pageX, startEvent.pageY, pageX, pageY) || 0;

    // eslint-disable-next-line no-console
    console.log(`onDistanceChange, distance:${distanceMoveed}`);

    // 移除onDistanceChange开始拖拽 解绑onDistanceChange
    if (distanceMoveed >= distance) {
      document.removeEventListener("mousemove", this[onDistanceChange]);
      this[startDrag]();
    }
  }

  // 鼠标移动
  [onMouseMove](event) {
    console.log("触发onMouseMove");
    if (!this.dragging) {
      return;
    }

    // 找到当前坐标点下最上层的 element 元素。
    const target = document.elementFromPoint(event.clientX, event.clientY);

    // 创建一个DragMoveSensorEvent实例, 传递给拖拽元素的drag:move事件
    const dragMoveEvent = new DragMoveSensorEvent({
      clientX: event.clientX,
      clientY: event.clientY,
      target,
      container: this.currentContainer,
      originalEvent: event,
    });

    // 触发拖拽元素的container的drag:move事件
    this.trigger(this.currentContainer, dragMoveEvent);
  }

  // 抬起鼠标
  [onMouseUp](event) {
    console.log("触发onMouseUp");

    // 解绑事件
    document.removeEventListener("mouseup", this[onMouseUp]);
    document.removeEventListener("dragstart", preventNativeDragStart);
    document.removeEventListener("mousemove", this[onDistanceChange]);
    document.removeEventListener("mousemove", this[onMouseMove]);

    if (!this.dragging) {
      return;
    }

    // 获取当前停留的target
    const target = document.elementFromPoint(event.clientX, event.clientY);

    const dragStopEvent = new DragStopSensorEvent({
      clientX: event.clientX,
      clientY: event.clientY,
      target,
      container: this.currentContainer,
      originalEvent: event,
    });

    // 触发currentContainer drag:stop事件
    this.trigger(this.currentContainer, dragStopEvent);

    // 拖拽事件结束
    this.currentContainer = null;
    this.dragging = false;
    this.startEvent = null;
  }
}

function preventNativeDragStart(event) {
  event.preventDefault();
}
