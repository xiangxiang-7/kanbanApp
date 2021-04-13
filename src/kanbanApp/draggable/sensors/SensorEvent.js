import BaseEvent from "../common/BaseEvent";

export class SensorEvent extends BaseEvent {
  get originalEvent() {
    return this.data.originalEvent;
  }

  get clientX() {
    return this.data.clientX;
  }

  get clientY() {
    return this.data.clientY;
  }

  get target() {
    return this.data.target;
  }

  get container() {
    return this.data.container;
  }

  get originalSource() {
    return this.data.originalSource;
  }
}

export class DragStartSensorEvent extends SensorEvent {
  static type = "drag:start";
}

export class DragMoveSensorEvent extends SensorEvent {
  static type = "drag:move";
}

export class DragStopSensorEvent extends SensorEvent {
  static type = "drag:stop";
}
