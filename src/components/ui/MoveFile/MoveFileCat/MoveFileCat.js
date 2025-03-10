"use client"

import { useState } from 'react'
import styles from './MoveFileCat.module.scss'

const MoveFileCat = ({
    category,
    activeCat,
    setActiveCat,
    id,
    type
}) => {

    const [children, setChildren] = useState([])
    const [expanded, setExpanded] = useState(false)

    const getChildren = async () => {
        let reponse = await fetch(`/api/category/${category.id}`)
        reponse = await reponse.json()
        let children = reponse.data.children
        setChildren(children)
    }

    return <div className={styles.MoveFileCat}>
        <div
            className={styles.categoryContainer}
            key={category.id}
        >
            <div className={`
                ${styles.category} 
                ${category.id == activeCat?.id ? styles.active : ""}`
            }>
                <button 
                    className='unstyled' 
                    onClick={() => setActiveCat({id: category.id, name: category.name})}
                >
                    {category.name}
                </button>
                <button
                    className='unstyled'
                    onClick={() => {
                        if (children.length === 0) {
                            getChildren(category.id)
                        }
                        setExpanded(!expanded)
                    }}
                >
                    <span className={`
                        material-icons 
                        ${styles.chevron} 
                        ${expanded ? styles.expanded : ''}
                    `}>
                        chevron_right
                    </span>
                </button>
            </div>
            {children.length > 0 ?
                <div className={styles.childContainer} style={{display: expanded ? 'block' : 'none'}}>
                    {children.map(child => {
                        if (type === 'category' && child.id == id) {
                            return
                        }
                        return <MoveFileCat
                            key={child.id}
                            category={child}
                            activeCat={activeCat}
                            setActiveCat={setActiveCat}
                            type={type}
                            id={id}
                        />
                    })}
                </div>
                : ""
            }
        </div>
    </div>
}

export default MoveFileCat