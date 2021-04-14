import React, { useState, useCallback } from 'react'
import { EditType } from '../constant'

// eslint-disable-next-line import/no-anonymous-default-export
interface Props{
  editData: {
    type:EditType,
    content:string
  },
  edit: (content:string)=>void,
  close: ()=>void,
}

const editTextMap = {
  [EditType.TASK]:'任务',
  [EditType.TITLE]:'看板'
}
export default function (props: Props) {
  const [inputValue,setInputValue] = useState('')
  // 输入修改后的内容
  const onChange = useCallback((e)=>{
    setInputValue(e.target.value)
  },[])

  // 确定修改
  const confirm = useCallback(()=>{
    if(inputValue === props.editData.content){
      alert('没做任何修改')
      return 
    }

    if(inputValue.length < 8 && inputValue.trim() !== ''){
      props.edit(inputValue)
      cancel()
    }else{
      alert(inputValue.length >=8 ? '标题超过字数' : '空标题')
    }
  },[inputValue])

  // 取消
  const cancel = useCallback(()=>{
    props.close()
    setInputValue('')
  },[])

  return props.editData ? <div className="edit-modal-container" >
    <div className="modal-content">
      <div className="input-wrap">
        <p>修改{editTextMap[props.editData.type]}标题(不超过8个字)</p>
        <input type="text" className="input-task" onChange={onChange} defaultValue={props.editData.content}/>
      </div>
      <div className="btn-wrap">
        <button onClick={confirm} className="ok">确定</button>
        <button onClick={cancel}>取消</button>
      </div>
    </div>
  </div>  : null
}