import React, { useEffect, useState } from 'react'

export default function test(){
  const [title, setTitle] = useState('测试')
  useEffect(()=>{
    setTitle('测试 1')
  },[])
  return <div>{title}</div>
}