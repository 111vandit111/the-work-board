import React from 'react'

const ColorSelector = ({ color , onClick } : { color : string , onClick : () => void }) => {
  return (
    <div className='w-10 h-10 rounded-full cursor-pointer border border-purple-600' style={{ backgroundColor : color }} onClick={onClick}></div>
  )
}

export default ColorSelector