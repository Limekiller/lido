"use client"

import { useEffect, useState } from "react"
import ViewContext from "@/lib/contexts/ViewContext"

import styles from './ViewContainer.module.scss'

const ViewContainer = ({ children }) => {
    const [view, setView] = useState('poster')

    const updateView = () => {
        let newView = 'poster'
        if (view === 'poster') {
            newView = 'list'
        }
        localStorage.setItem('view', newView)
        setView(newView)
    }

    useEffect(() => {
        let savedView
        savedView = localStorage.getItem('view')
        if (!savedView) {
            savedView = 'poster'
        }
        localStorage.setItem('view', savedView)
        setView(savedView)
    }, [])

    return <ViewContext
        value={{
            view: view
        }}
    >
        <button 
            className={`${styles.ViewContainer} unstyled`} 
            onClick={updateView}
        >
            <span className="material-icons">{view === 'poster' ? 'view_list' : 'grid_view'}</span>
        </button>
        {children}
    </ViewContext>
}

export default ViewContainer