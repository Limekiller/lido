"use client"

import { useEffect, useState, useRef } from "react"
import ContextMenuContext from "@/lib/contexts/ContextMenuContext"

import styles from './ContextMenuContainer.module.scss'

const ContextMenuContainer = ({ children }) => {
    const wrapperRef = useRef(null);

    const [contextItems, setContextItems] = useState([])
    const [isDisplaying, setIsDisplaying] = useState(false)
    const [menuPos, setMenuPos] = useState([0, 0])
    const [lastActiveElem, setLastActiveElem] = useState(null)

    const showMenu = (e, items) => {
        let x = e.clientX
        let y = e.clientY

        if (!x && !y) {
            const rect = e.target.getBoundingClientRect()
            x = rect.left
            y = rect.top
        }

        setMenuPos([x, y])
        setContextItems(items)
        setIsDisplaying(true)
    }

    const handleClickOutside = event => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
            setIsDisplaying(false);
        }
    }

    useEffect(() => {
        SpatialNavigation.enable('contextMenu')
        if (!document.body.classList.contains('hasMessages')) {
            SpatialNavigation.enable('mainNav')
        }
        if (isDisplaying) {
            setLastActiveElem(document.activeElement)
            document.querySelector('#contextMenu button').focus()
            SpatialNavigation.disable('mainNav')
        } else {
            lastActiveElem?.focus()
        }
    }, [isDisplaying])

    useEffect(() => {
        SpatialNavigation.add(`contextMenu`, {
            selector: `#contextMenu button`,
            defaultElement: `#contextMenu button`
        })

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
                id='contextMenu'
                style={{ left: `${menuPos[0]}px`, top: `${menuPos[1]}px` }}
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