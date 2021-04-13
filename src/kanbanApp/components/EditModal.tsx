import React, { useState, useCallback } from 'react'

// eslint-disable-next-line import/no-anonymous-default-export
export default function (props) {
  const [inputValue,setInputValue] = useState('')
  // 输入修改后的任务标题
  const onChange = useCallback((e)=>{
    setInputValue(e.target.value)
  },[])

  // 确定修改任务
  const confirm = useCallback(()=>{
    if(inputValue === props.task.title){
      alert('没做任何修改')
      return 
    }

    if(inputValue.length < 8 && inputValue.trim() !== ''){
      props.edit(inputValue)
      cancel()
    }else{
      alert(inputValue.length >=8 ? '任务标题超过字数' : '空标题不能创建任务')
    }
  },[inputValue])

  // 取消
  const cancel = useCallback(()=>{
    props.close()
    setInputValue('')
  },[])


  return props.task ? <div className="edit-modal-container" >
    <div className="modal-content">
      <div className="input-wrap">
        <p>修改任务标题(不超过8个字)</p>
        <input type="text" className="input-task" onChange={onChange} defaultValue={props.task.title}/>
      </div>
      <div className="btn-wrap">
        <button onClick={confirm} className="ok">确定</button>
        <button onClick={cancel}>取消</button>
      </div>
    </div>
  </div>  : null
}