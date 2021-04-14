const canceled = Symbol("canceled");

export default class BaseEvent {
  static type = "event";

  constructor(data) {
    this[canceled] = false;
    this.data = data;
  }

  get type() {
    return this.constructor.type;
  }

  cancel() {
    this[canceled] = true;
  }

  canceled() {
    return Boolean(this[canceled]);
  }

  get draggable() {
    return this.data.draggable;
  }
}
