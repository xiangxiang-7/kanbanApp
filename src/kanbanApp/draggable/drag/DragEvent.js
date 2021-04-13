import BaseEvent from "../common/BaseEvent";

export class DraggableInitializedEvent extends BaseEvent {
  static type = "draggable";

  static DraggableInitializedEvent = "draggable:initialize";
}
export class DragEvent extends BaseEvent {
  static type = "drag";

  // 传感器的event 作透传
  get sensorEvent() {
    return this.data.sensorEvent;
  }

  // 当前事件的类型
  get eventType() {
    return this.constructor.type;
  }

  // 原始拖拽元素
  get sourceEle() {
    return this.data.sourceEle;
  }

  // 原始container
  get sourceContainerEle() {
    return this.data.sourceContainerEle;
  }

  // 目标拖拽元素
  get targetEle() {
    return this.data.targetEle;
  }

  // 目标container
  get targetContainerEle() {
    return this.data.targetContainerEle;
  }

  // 最后被拖拽的元素
  get lastPlacedsourceEle() {
    return this.data.lastPlacedsourceEle;
  }

  // 最后进入的container
  get lastPlacedContainerId() {
    return this.data.lastPlacedContainerId;
  }
}
export class DragStartEvent extends DragEvent {
  static type = "drag:start";
}
export class DragMoveEvent extends DragEvent {
  static type = "drag:move";
}
// 边界判断进入拖拽元素
export class DragInSourceEvent extends DragEvent {
  static type = "drag:in:source";
}
export class DragOutSourceEvent extends DragEvent {
  static type = "drag:out:source";
}
export class DragInContainerEvent extends DragEvent {
  static type = "drag:in:container";
}
export class DragOutContainerEvent extends DragEvent {
  static type = "drag:out:container";
}
export class DragStopEvent extends DragEvent {
  static type = "drag:stop";
}
export class DragStoppedEvent extends DragEvent {
  static type = "drag:stopped";
}
