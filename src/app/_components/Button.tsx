import React from 'react'

const Button = ({ onClick , className, variant , children , disabled } : { onClick : () => void , className? : string, disabled? : boolean , variant? : 'primary' | 'secondary' | 'danger' | 'success' | 'warning' , children : React.ReactNode }) => {
  const variantClass = {
    primary: 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded',
    secondary: 'bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded',
    danger: 'bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded',
    success: 'bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded',
    warning: 'bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded',
  }
  return (
    <button disabled={disabled} className={`${variantClass[variant || 'primary']} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={onClick}>{children}</button>
  )
}

export default Button