

declare global {
  interface Window {
    kanbanAppData: Array<any>;
  }
}

export enum TaskStatusType {
  CREATE = 'CREATE', // 未完成
  FINISH = 'FINISH', // 已完成
  GARBAGE = 'GARBAGE' // 被丢弃
}
export enum ContainerStatusType {
  CONTAINER_CREATE = 'CONTAINER_CREATE', // 未完成任务列表Id
  CONTAINER_FINISH = 'CONTAINER_FINISH' // 已完成任务列表Id
}

export interface TaskType{
  id: string, // 时间戳作为唯一任务ID
  title: string, // 任务标题
  status: TaskStatusType // 任务状态
}


// app标题
export const TITLE = '任务管理列表'
// 任务类型
export const taskStatusTitleMap = {
  create: '未完成',
  finish: '已完成',
  garbage: '垃圾箱'
}

// 默认未完成任务
export const CREATETASKLIST: TaskType[] = [
  {
    id: 'c-1',
    title:'起床',
    status: TaskStatusType.CREATE,
  },
  {
    id: 'c-2',
    title:'吃早饭',
    status: TaskStatusType.CREATE
  }
]

// 默认已完成任务
export const FINISHTASKLIST: TaskType[] = [
  {
    id:'f-1', 
    title:'12点前睡觉',
    status: TaskStatusType.FINISH
  }
]

export const draggableCalss =  `.task--isDraggable`
export const containerCalss =  `.task--isContainer`

export const draggableDragStartClass= '.drag-start'