"use client"

import { useEffect, useState, useRef } from "react"
import ContextMenuContext from "@/lib/contexts/ContextMenuContext"

import styles from './ContextMenuContainer.module.scss'

const ContextMenuContainer = ({ children }) => {
    const wrapperRef = useRef(null);

    const [contextItems, setContextItems] = useState([])
    const [isDisplaying, setIsDisplaying] = useState(false)
    const [menuPos, setMenuPos] = useState([0, 0])

    const showMenu = (e, items) => {
        setMenuPos([e.clientX, e.clientY])
        setContextItems(items)
        setIsDisplaying(true)
    }

    const handleClickOutside = event => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
            setIsDisplaying(false);
        }
      }

    useEffect(() => {
        document.addEventListener('contextmenu', event => event.preventDefault())
        document.addEventListener("click", handleClickOutside, false)
        return () => {
            document.removeEventListener("click", handleClickOutside, false)
        }
    }, [])

    return <ContextMenuContext
        value={{
            showMenu: showMenu
        }}
    >
        {isDisplaying ?
            <div 
                className={styles.ContextMenu}
                style={{left: `${menuPos[0]}px`, top: `${menuPos[1]}px`}}
                ref={wrapperRef}
            >
                {contextItems.map(item => {
                    return <button 
                        key={item.label} 
                        className={`unstyled ${styles.item}`}
                        onClick={() => {
                            setIsDisplaying(false)
                            item.function()
                        }}
                    >
                        {item.icon ? <span className="material-icons">{item.icon}</span> : ""}
                        {item.label}
                    </button>
                })}
            </div> : ""
        }
        {children}
    </ContextMenuContext>
}

export default ContextMenuContainer