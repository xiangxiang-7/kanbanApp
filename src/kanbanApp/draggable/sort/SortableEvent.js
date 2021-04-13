import BaseEvent from '../common/BaseEvent';


export class SortableEvent extends BaseEvent {
  static type = 'sortable';

  // 透传drag的event
  get dragEvent() {
    return this.data.dragEvent;
  }
}


export class SortableStartEvent extends SortableEvent { static type = 'sortable:start'}

export class SortableSortEvent extends SortableEvent { static type = 'sortable:sort'}

export class SortableSortedEvent extends SortableEvent { static type = 'sortable:sorted'}

export class SortableStopEvent extends SortableEvent {static type = 'sortable:stop';}
