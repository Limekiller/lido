"use client"

import { useEffect, useState, useRef } from 'react'
import styles from './PillSelector.module.scss'

const PillSelector = ({
    options,
    parentSetFunction
}) => {
    const maskRef = useRef(null);
    const [active, setActive] = useState(0)

    useEffect(() => {
        const optionElem = document.querySelector(`#option-${active}`)

        const childRect = optionElem.getBoundingClientRect();
        const parentRect = optionElem.parentElement.getBoundingClientRect();
        const relativeLeft = childRect.left - parentRect.left;

        maskRef.current.style.width = optionElem.clientWidth + 'px'
        maskRef.current.style.left = relativeLeft + 'px'

        parentSetFunction(options[active].value)
    }, [active])
    
    return <div className={styles.PillSelector}>
        <div 
            ref={maskRef}
            className={styles.mask} 
        />
        {options.map((option, index) => {
            return <button 
                className={styles.option}
                id={`option-${index}`}
                key={index}
                onClick={() => setActive(index)}
            >
                {option.label}
            </button>
        })}
    </div>
}

export default PillSelector