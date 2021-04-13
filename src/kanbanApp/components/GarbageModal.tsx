import React, {useCallback } from 'react'

// eslint-disable-next-line import/no-anonymous-default-export
export default function (props) {

  // 确定删除
  const deleteTask = useCallback(()=>{
    props.garbage(props.task)
    cancel()
  },[])

  // 取消
  const cancel = useCallback(()=>{
    props.close()
  },[])


  return  props.task ?  <div className="del-modal-container" >
    <div className="modal-content">
      <div className="input-wrap">
        <p>删除任务: {props.task.title}</p>
      </div>
      <div className="btn-wrap">
        <button onClick={deleteTask} className="ok">确定</button>
        <button onClick={cancel}>取消</button>
      </div>
    </div>
  </div> : null
}