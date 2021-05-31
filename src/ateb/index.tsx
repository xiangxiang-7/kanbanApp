// ateb学习
import React, { useCallback, useState } from 'react'
// import addShowTime from './decoration/showTime'

interface Comment {
  id: string,
  content: string,
}


export default function Ateb () {
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsShowTime, setCommentsShowTime] = useState<Record<string,string>>({})
  const [inputValue, setInputValue] = useState<string>('')

  const onChange = useCallback((e:event)=>{
    setInputValue(e.target.value)
  },[])
  const submit = useCallback(()=>{
    const id = Date.now().toString()
    setComments([...comments,{
      id,
      content: inputValue
    }])
    setCommentsShowTime({...commentsShowTime,[id]:id})
    setInputValue('')
  },[comments, commentsShowTime, inputValue])



  return (
    <div>
      <div>
        <input type="text" onChange={onChange} value={inputValue}/>
      </div>

      <div onClick={submit}>add</div>
      {comments.map((comment:Comment)=><div>
          <div>{comment.content}---{commentsShowTime[comment.id]}</div>
        </div>)
      }
    </div>
    
  )
}