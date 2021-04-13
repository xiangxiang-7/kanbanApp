import { closest } from "../../utils";
import Emitter from "../common/Emitter";
import MouseSensor from "../sensors/MouseSensor";

import {
  DraggableInitializedEvent,
  DragStartEvent,
  DragMoveEvent,
  DragOutContainerEvent,
  DragOutSourceEvent,
  DragInContainerEvent,
  DragInSourceEvent,
  DragStopEvent,
  DragStoppedEvent,
} from "./DragEvent";

const onDragStart = Symbol("onDragStart");
const onDragMove = Symbol("onDragMove");
const onDragStop = Symbol("onDragStop");
const dragStop = Symbol("dragStop");

const defaultClasses = {
  "drag:start": "draggable-source-start",
};

export const defaultOptions = {
  draggable: ".draggable-source",
  classes: defaultClasses,
  delay: 0,
  distance: 10,
  sensors: [MouseSensor],
};

export default class Draggable {
  constructor(containerData = [], options = {}) {
    const containerIds = containerData.map((a) => a.containerId);
    const containerObj = {};
    containerData.forEach((c) => {
      containerObj[c.containerId] = c.draggableList;
    });
    if (containerIds.length === 0) {
      throw new Error("containerData invalid check containerData.length !== 0");
    }
    this.containerIds = containerIds;
    this.containerObj = containerObj;
    this.containerEles = this.initContainerById(containerIds);

    this.options = {
      ...defaultOptions,
      ...options,
    };
    this.emitter = new Emitter();
    this.dragging = false;
    this.plugins = [];
    this.sensors = [];

    this[onDragStart] = this[onDragStart].bind(this);
    this[onDragMove] = this[onDragMove].bind(this);
    this[onDragStop] = this[onDragStop].bind(this);
    this[dragStop] = this[dragStop].bind(this);

    document.addEventListener("drag:start", this[onDragStart], true);
    document.addEventListener("drag:move", this[onDragMove], true);
    document.addEventListener("drag:stop", this[onDragStop], true);

    this.addSensor(this.options.sensors);

    const draggableInitializedEvent = new DraggableInitializedEvent({
      draggable: this,
    });

    this.trigger(draggableInitializedEvent);
  }

  // 用唯一ID初始化拖拽容器
  initContainerById(containerIds) {
    if (Object.prototype.toString.call(containerIds) === "[object Array]") {
      this.containerIds = [...containerIds];
    } else if (
      Object.prototype.toString.call(containerIds) === "[object String]"
    ) {
      this.containerIds = [containerIds];
    } else {
      throw new Error(
        "Draggable containersIds are expected to be of type `Array<string>`",
      );
    }

    return containerIds.map((id) => {
      const containerSelector = document.querySelector(`#${id}`);
      if (containerSelector instanceof Node) {
        return containerSelector;
      }
      throw new Error(
        "Draggable containersId are invalid, no HTMLElement found`",
      );
    });
  }

  destroy() {
    document.removeEventListener("drag:start", this[onDragStart], true);
    document.removeEventListener("drag:move", this[onDragMove], true);
    document.removeEventListener("drag:stop", this[onDragStop], true);
  }

  // 传感器初始化
  addSensor(sensors) {
    const activeSensors = sensors.map(
      (Sensor) => new Sensor(this.containerEles, this.options),
    );

    activeSensors.forEach((sensor) => sensor.apply());
    this.sensors = [...activeSensors];

    return this;
  }

  // 取消draggable 直接执行drag:stop事件
  cancel() {
    this[dragStop]();
  }

  on(type, ...callbacks) {
    this.emitter.on(type, ...callbacks);
    return this;
  }

  off(type, callback) {
    this.emitter.off(type, callback);
    return this;
  }

  trigger(event) {
    this.emitter.trigger(event);
    return this;
  }

  getClassNameFor(name) {
    return this.getClassNamesFor(name)[0];
  }

  getClassNamesFor(name) {
    const classNames = this.options.classes[name];

    if (classNames instanceof Array) {
      return classNames;
    }
    if (typeof classNames === "string" || classNames instanceof String) {
      return [classNames];
    }
    return [];
  }

  isDragging() {
    return Boolean(this.dragging);
  }

  getDraggableElements() {
    return this.containerEles.reduce(
      (current, container) => [
        ...current,
        ...this.getDraggableElementsForContainer(container),
      ],
      [],
    );
  }

  getDraggableElementsForContainer(container) {
    const allDraggableElements = container.querySelectorAll(
      this.options.draggable,
    );

    return [...allDraggableElements].filter(
      (childElement) => childElement !== this.originalSource,
    );
  }

  // 由mousemove的 onDistanceChange阶段触发
  [onDragStart](event) {
    console.log("触发drag: start");
    const sensorEvent = getSensorEvent(event);
    const { container, originalSource } = sensorEvent;

    const sourceEle = originalSource;
    const sourceContainerEle = container;
    if (!sourceEle) {
      throw new Error("drag Element must exit");
    }

    const dragEvent = new DragStartEvent({
      sourceEle,
      sourceContainerEle,
      sensorEvent,
    });

    // 缓存start的拖拽sourceEle和sourceContainerEle
    this.sourceEle = sourceEle;
    this.sourceContainerEle = sourceContainerEle;

    // 当前拖拽的元素添加class
    // sensorEvent.target.classList.add(this.options.classes[dragEvent.type])

    this.trigger(dragEvent);

    this.dragging = !dragEvent.canceled();

    // 鼠标按住移动的时候不能选中任意文字
    applyUserSelect(document.body, "none");
  }

  //  由onmousemove触发
  [onDragMove](event) {
    console.log("触发drag: move");
    if (!this.dragging) {
      return;
    }

    const sensorEvent = getSensorEvent(event);
    const { target } = sensorEvent;

    const dragMoveEvent = new DragMoveEvent({
      sensorEvent,
    });

    // 广播'drag:move' 拖拽move事件被取消的时候 取消传感器move事件
    this.trigger(dragMoveEvent);
    if (dragMoveEvent.canceled()) {
      sensorEvent.cancel();
      return;
    }

    // 找到鼠标所在可拖拽的元素
    const targetEle = closest(target, this.options.draggable);
    // 获取当前鼠标所在container
    const targetContainerEle = closest(sensorEvent.target, this.containerEles);

    // 离开拖拽元素
    const isOutSource = this.targetEle && targetEle !== this.targetEle;
    // 离开container
    const isOutContainer = this.targetContainerEle && !targetContainerEle;
    // 进入container
    const isInContainer =
      targetContainerEle && this.targetContainerEle !== targetContainerEle;
    // 进入拖拽元素
    const isInSource =
      targetContainerEle && targetEle && this.targetEle !== targetEle;

    // 鼠标离开拖拽元素
    if (isOutSource) {
      console.log(`触发drag:out:source ${this.targetEle}`);
      const dragOutSourceEvent = new DragOutSourceEvent({
        sourceEle: this.sourceEle,
        sourceContainerEle: this.sourceContainerEle,
        targetEle,
        targetContainerEle,
        sensorEvent,
      });

      // this.targetEle = null;
      this.targetEle = null;
      this.trigger(dragOutSourceEvent);
    }

    // 鼠标离开container
    if (isOutContainer) {
      console.log(`触发drag:out:container ${this.targetContainerEle}`);
      const dragOutContainerEvent = new DragOutContainerEvent({
        sourceEle: this.sourceEle,
        sourceContainerEle: this.sourceContainerEle,
        targetEle,
        targetContainerEle,
        sensorEvent,
      });

      this.targetContainerEle = null;
      this.trigger(dragOutContainerEvent);
    }

    // 鼠标进入container
    if (isInContainer) {
      console.log(`触发drag:in:container ${targetContainerEle}`);

      const dragInContainerEvent = new DragInContainerEvent({
        sourceEle: this.sourceEle,
        sourceContainerEle: this.sourceContainerEle,
        targetEle: null,
        targetContainerEle,
        sensorEvent,
      });

      this.targetContainerEle = targetContainerEle;
      this.sourceContainerEle = targetContainerEle;

      this.trigger(dragInContainerEvent);
    }

    // 鼠标进入拖拽元素
    if (isInSource) {
      console.log("触发drag:in:source", target.dataset.id);
      const dragInSourceEvent = new DragInSourceEvent({
        sourceEle: this.sourceEle,
        sourceContainerEle: this.sourceContainerEle,
        targetEle,
        targetContainerEle,
        sensorEvent,
      });
      this.targetEle = targetEle;

      this.trigger(dragInSourceEvent);
    }
  }

  // 由onmouseup触发
  [dragStop](event) {
    console.log("触发dragStop");
    if (!this.dragging) {
      return;
    }

    this.dragging = false;

    const dragStopEvent = new DragStopEvent({
      sourceEle: this.sourceEle,
      sourceContainerEle: this.sourceContainerEle,
      targetEle: this.targetEle,
      targetContainerEle: this.targetContainerEle,
      sensorEvent: event ? event.sensorEvent : null,
    });

    this.trigger(dragStopEvent);

    if (dragStopEvent.canceled()) {
      return;
    }

    // 元素变为可选
    applyUserSelect(document.body, "");

    const dragStoppedEvent = new DragStoppedEvent({
      sourceEle: this.sourceEle,
      sourceContainerEle: this.sourceContainerEle,
      targetEle: this.targetEle,
      targetContainerEle: this.targetContainerEle,
      lastPlacedsourceEle: this.sourceEle,
      lastPlacedContainerId: this.targetContainerEle,
      sensorEvent: event ? event.sensorEvent : null,
    });

    // 广播drag:stop 事件
    this.trigger(dragStoppedEvent);

    this.sourceEle = null;
    this.sourceContainerEle = null;
    this.targetEle = null;
    this.targetContainerEle = null;
  }

  [onDragStop](event) {
    this[dragStop](event);
  }
}

function getSensorEvent(event) {
  return event.detail;
}

function applyUserSelect(element, value) {
  element.style.webkitUserSelect = value;
  element.style.mozUserSelect = value;
  element.style.msUserSelect = value;
  element.style.oUserSelect = value;
  element.style.userSelect = value;
}
