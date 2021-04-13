import Draggable from '../drag/Draggable';
import { SortableStartEvent, SortableSortEvent, SortableStopEvent } from './SortableEvent';

const onDragStart = Symbol('onDragStart');
const onDragInContainer = Symbol('onDragInContainer');
const onDragInSource = Symbol('onDragInSource');
const onDragStop = Symbol('onDragStop');

export default class Sortable extends Draggable {
  constructor(containers = [], options = {}) {
    super(containers, {
      ...options,
    });


    this[onDragStart] = this[onDragStart].bind(this);
    this[onDragInContainer] = this[onDragInContainer].bind(this);
    this[onDragInSource] = this[onDragInSource].bind(this);
    this[onDragStop] = this[onDragStop].bind(this);


    // 绑定类事件 Draggable在当前docuemnt绑定了事件
    this.on('drag:start', this[onDragStart])
      .on('drag:in:container', this[onDragInContainer])
      .on('drag:in:source', this[onDragInSource])
      .on('drag:stop', this[onDragStop]);
  }


  destroy() {
    super.destroy();

    this.off('drag:start', this[onDragStart])
      .off('drag:in:container', this[onDragInContainer])
      .off('drag:in:source', this[onDragInSource])
      .off('drag:stop', this[onDragStop]);
  }

  [onDragStart](event) {
    const sortableStartEvent = new SortableStartEvent({
      dragEvent: event,
    });

    this.trigger(sortableStartEvent);
    if (sortableStartEvent.canceled()) {
      event.cancel();
    }
  }

  [onDragInContainer](event) {
    this[onDragInSource](event)
  }

  // 进入拖拽元素
  [onDragInSource](event) {
    const { sourceEle, targetEle } = event
    if (sourceEle?.dataset.id === targetEle?.dataset.id) {
      return
    }

    const sortableSortEvent = new SortableSortEvent({
      dragEvent: event,
    });

    // 广播 sortable:sort事件
    this.trigger(sortableSortEvent);
  }

  [onDragStop](event) {
    const sortableStopEvent = new SortableStopEvent({
      dragEvent: event,
    });

    this.trigger(sortableStopEvent);
  }
}
