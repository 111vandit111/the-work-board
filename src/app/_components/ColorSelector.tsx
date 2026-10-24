import React from 'react'

const ColorSelector = ({ color , onClick } : { color : string , onClick : () => void }) => {
  return (
    <div className='w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full cursor-pointer border border-purple-600' style={{ backgroundColor : color }} onClick={onClick}></div>
  )
}

export default ColorSelector