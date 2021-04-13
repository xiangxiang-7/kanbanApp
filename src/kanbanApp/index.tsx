import React, { useEffect, useState, useCallback } from 'react'
import {draggableCalss,containerCalss, FINISHTASKLIST, CREATETASKLIST, taskStatusTitleMap, TITLE} from './constant'
import {TaskStatusType,ContainerStatusType,TaskType} from './constant'
import Sortable from './draggable/sort/Sortable';
import move from './draggable/sort/move'
import { closest } from './utils'
import AddModal from './components/AddModal'
import EditModal from './components/EditModal'
import GarbageModal from './components/GarbageModal'
import './index.scss';


const getDraggableList = (id:string) => {
  return getContainer(id).draggableList
}
const getContainer = (id:string) => {
  return window.kanbanAppData.filter(c => id === c.containerId )[0]
}

const indexOf = (arr:Array<any>, id:string) => {
  const item = arr.filter(a => id === a.id)[0]
  return arr.indexOf(item)
}

// 种缓存
const cacheKanbanAppDate = () => {
  window.kanbanAppData.forEach((c:any) => {
    localStorage.setItem(`${c.containerId}`,JSON.stringify(c.draggableList))
  });
}

export default function KanbanApp () {
  const [createTaskList, setCreateTaskList] = useState<Array<TaskType>>([])
  const [finishTaskList, setFinishTaskList] = useState<Array<TaskType>>([])

  // 获取缓存数据
  useEffect(()=>{
    try{
      const createListItem = localStorage.getItem(`${ContainerStatusType.CONTAINER_CREATE}`)
      console.log(createListItem)
      const createList = createListItem ? JSON.parse(createListItem) :  CREATETASKLIST
      createList && setCreateTaskList(createList)

      const finishListItem = localStorage.getItem(`${ContainerStatusType.CONTAINER_FINISH}`)
      console.log(finishListItem)
      const finishList = finishListItem ? JSON.parse(finishListItem) :  FINISHTASKLIST
      finishList && setFinishTaskList(finishList)
      console.log(createList,finishList)
    }catch(e){
      setCreateTaskList(CREATETASKLIST)
      setFinishTaskList(FINISHTASKLIST)
      console.error('缓存读取失败')
    }
  },[])

  // 看板大数据
  window.kanbanAppData = [{
    containerId:ContainerStatusType.CONTAINER_CREATE,
    draggableList:[...createTaskList],
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    dispatch: (list:any)=>{ setCreateTaskList(list), cacheKanbanAppDate()}
  },{
    containerId:ContainerStatusType.CONTAINER_FINISH,
    draggableList:[...finishTaskList],
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    dispatch: (list:any)=>{ setFinishTaskList(list), cacheKanbanAppDate()}
  }]

  // 多个container初始化
  useEffect(()=>{
    const MultipleContainers = () => {
      const sortable = new Sortable(window.kanbanAppData, {
        draggable: draggableCalss,
      });
    
      sortable.on('sortable:sort', (e:any) => {
        // const {sourceId, sourceContainerId, targetId, targetContainerId } = evt.data
        const { sourceEle, sourceContainerEle, targetEle, targetContainerEle } = e.dragEvent
        
        // 获取ID进行move
        const sourceContainerId =  sourceContainerEle?.dataset.id 
        const targetContainerId =  targetContainerEle?.dataset.id 
        const sourceId = sourceEle?.dataset.id 
        const targetId = targetEle?.dataset.id 
        console.log('=======   开始move ======')
        console.log(`${sourceId}  ==> ${targetId} ${sourceContainerId} ==> ${targetContainerId}`)
        if(!sourceContainerId || !targetContainerId || !sourceId){
          return
        }
       const moves = move({
          sourceId,
          sourceContainerId,
          sourceContainerList: getDraggableList(sourceContainerId),
          targetId,
          targetContainerId,
          targetContainerList: getDraggableList(targetContainerId),
        });
    
        if (!moves) {
          return;
        }
        console.log('=======   排序结果 ======')
        console.log(`${moves.sourceContainerList.map((i:any)=>i.id).join('__')} `)
        console.log(`${moves.targetContainerList.map((i:any)=>i.id).join('__')} `)

        // 修改任务状态
        const taskIndex = indexOf(moves.targetContainerList,sourceId)
        const moveTask = taskIndex !== -1 && moves.targetContainerList[taskIndex]
        if( moveTask && !new RegExp(moveTask.status).test(targetContainerId)){
          moveTask.status = targetContainerId.split('_')[1]
        }
        const { sourceContainerList:newSourceContainerList, targetContainerList:newTargetContainerList } = moves

        // 更新列表数据
        window.kanbanAppData.forEach(container =>{
          if(container.containerId === sourceContainerId){
            container.dispatch([...newSourceContainerList])
          }

          if(container.containerId === targetContainerId){
            container.dispatch([...newTargetContainerList])
          }

        })
      });
    }
    MultipleContainers()
  },[])

  // 打开/关闭添加任务modal
  const [isShowAddModal,setShowAddModal] = useState(false)
  const openAddModal = useCallback(()=>{
    setShowAddModal(true)
  },[])
  const closeAddModal = useCallback(()=>{
    setShowAddModal(false)
  },[])
  // 添加一个未完成的任务
  const addTask = useCallback((title) => {
    if(!title){
      return 
    }
    const taskId = Date.now().toString()
    const container = getContainer(ContainerStatusType.CONTAINER_CREATE)
    container.draggableList.push({
      id: `c-${taskId}`,
      title:`${title}`,
      status: TaskStatusType.CREATE
    })
    container.dispatch([...container.draggableList])
  }, []);


  // 打开/关闭删除任务modal
  const [isShowGarbageModal,setShowGarbageModal] = useState(false)
  const [garbageTaskList, setGarbageTaskList] = useState<TaskType[]>([])
  const openGarbageModal = useCallback((task)=>{
    setShowGarbageModal(true)
    setcurrentTask(task)
  },[])
  const closeGarbageModal = useCallback(()=>{
    setShowGarbageModal(false)
    setcurrentTask(null)
  },[])
  // 删除按钮删除任务
  const garbageTask = useCallback((task)=>{
    if(!task){
      return
    }
    // 从源列表删除
    const currentContainerId = `CONTAINER_${task.status}`
    const container = getContainer(currentContainerId)

    const taskIndex = indexOf(container.draggableList,task.id)
    container.draggableList.splice(taskIndex,1)
    container.dispatch([...container.draggableList])

    // 添加垃圾箱列表
    task.status = TaskStatusType.GARBAGE
    setGarbageTaskList([task,...garbageTaskList])
  },[garbageTaskList])


 
  // 当前操作的任务
  const [currentTask, setcurrentTask] = useState(null)
  // 双击编辑任务标题
  const [isShowEditModal,setShowEditModal] = useState(false)
  const editTask = useCallback((title)=>{
    if(!currentTask){return}

    // 更新列表数据
    // eslint-disable-next-line
    const currentContainerId = `CONTAINER_${currentTask.status}`
    const container = getContainer(currentContainerId)
    if(!container) {return}

    // eslint-disable-next-line
    const taskIndex = indexOf(container.draggableList, currentTask.id) 
    container.draggableList[taskIndex].title = title
    container.dispatch([...container.draggableList])
  },[currentTask])
  // 打开/关闭 编辑弹窗
  const openEditModal = useCallback((event)=>{
    const containerTarget = closest(event.target, containerCalss)
    const container = getContainer(containerTarget.id)
    const taskIndex = indexOf(container.draggableList, event.target.dataset.id)
    const currentTask = container.draggableList[taskIndex]
    if(currentTask){
      setcurrentTask(currentTask)
      setShowEditModal(true)
    }
    console.log(currentTask)
  },[])
  const closeEditModal = useCallback(()=>{
    setShowEditModal(false)
    setcurrentTask(null)
  },[])


  // 使用受控组件来处理数据,数据由react来管理
  return <div className="kanban-app" >
    <div className="kanban-content">
      <div className="kanban-title">{TITLE}</div>
      {/* 未完成任务列表 */}
      <div className="task-container">
        <div className="add-one-task" onClick={openAddModal}>添加</div>
        <div className="task-type-title">{taskStatusTitleMap.create}</div>
        <div className="task-list task--isContainer" id="CONTAINER_CREATE" data-id="CONTAINER_CREATE" onDoubleClick={openEditModal}>
          {createTaskList.map((task) => <div className={`task TaskListItem task--isDraggable`}  key={task.id} data-id={task.id}>
            <span className="garbage-icon" onClick={()=>{openGarbageModal(task)}}>x</span>
            {task.title}
          </div>)}
        </div>
      </div>

      {/* 已完成任务列表 */}
      <div className="task-container finish">
        <div className="task-type-title">{taskStatusTitleMap.finish}</div>
        <div className="task-list task--isContainer" id="CONTAINER_FINISH" data-id="CONTAINER_FINISH" onDoubleClick={openEditModal}>
          {finishTaskList.map((task) => <div className={`task TaskListItem task--isDraggable`}  key={task.id} data-id={task.id}>
            <span className="garbage-icon" onClick={()=>{openGarbageModal(task)}}>x</span>
            {task.title}
            </div>)}
        </div>
      </div>
    </div>

    {/* 垃圾箱 */}
    <div className="task-container garbage">
      <div className="task-type-title">{taskStatusTitleMap.garbage}</div>
      <div className="task-list StackedList" id="CONTAINER_GABAGE" data-id="CONTAINER_GABAGE">
        {garbageTaskList.map((task) => <div className={`task StackedListItem task--isDraggable`}  key={task.id} data-id={task.id}>
          {task.title}
          </div>)}
      </div>
    </div>

    


    {/* 添加任务弹窗 */}
    {isShowAddModal && <AddModal add={addTask} close={closeAddModal}/>}
    {/* 编辑任务弹窗 */}
    {isShowEditModal && <EditModal task={currentTask} edit={editTask} close={closeEditModal}/>}
    {/* 删除任务弹窗 */}
    {isShowGarbageModal && <GarbageModal task={currentTask} garbage={garbageTask} close={closeGarbageModal}/>}
  </div>
}