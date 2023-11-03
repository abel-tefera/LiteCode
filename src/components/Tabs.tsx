import React from 'react'
import Tab from './Tab'

const Tabs = () => {
    const onSelect = (i: any) => {
        alert(`Tab ${i} selected`)
    }
  return (
    <div className={`w-[64rem] my-1 flex flex-row items-center overflow-x-scroll custom-scrollbar`}>
        {
            Array(5).fill(0).map((_, i) => (
                <Tab id={i} name={'index.js'} type={'jsx'} selected={i === 3} onSelect={onSelect} />
            ))
        }
    </div>
  )
}

export default Tabs