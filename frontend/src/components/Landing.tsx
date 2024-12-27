import React, { useState } from 'react'
import { Link } from 'react-router-dom';



const Landing = () => {
    const [name, setName] = useState('');
  return (
    <div>
        <input type="text" onChange={e => setName(e.target.value)}  className='px-4 py-2 rounded-xl border-black'/>
        <Link to={`/room?name=${name}`} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4  ml-5 rounded-xl'>Join</Link>

    </div>
  )
}

export default Landing