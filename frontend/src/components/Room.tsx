import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'



const Room = () => {
    const [searchParams] = useSearchParams();

    const name = searchParams.get('name');

    useEffect(()=> {
        console.log(name)
    })
  return (
    <div>Room</div>
  )
}

export default Room