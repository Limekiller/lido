"use client"

import { useState } from "react"
import ToastContext from "@/lib/ToastContext"

import styles from './ToastContainer.module.scss'

const ToastContainer = ({ children }) => {
    const [toasts, setToasts] = useState([])

    const createToast = data => {
        const time = data.time || 5000
        const id = Date.now()
        setToasts([...toasts, { ...data, id: id }])

        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id))
        }, time)
    }

    return <ToastContext
        value={{
            createToast: createToast
        }}
    >
        <div className={`
            ${styles.ToastContainer}
        `}>
            {toasts.map(toast => {
                return <div className={styles.toast} key={toast.id}>
                    <span>{toast.message}</span>
                </div>
            })}
        </div>
        {children}
    </ToastContext>
}

export default ToastContainer