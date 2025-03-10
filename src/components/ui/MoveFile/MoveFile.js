"use client"

import { useState } from 'react'

import MoveFileCat from './MoveFileCat/MoveFileCat'
import styles from './MoveFile.module.scss'

const MoveFile = ({
    type='file',
    label="Move to ",
    id
}) => {

    const [activeCat, setActiveCat] = useState({id: 0, name: 'Movies'})

    const categories = {
        0: {
            id: 0,
            name: 'Movies'
        },
        1: {
            id: 1,
            name: 'TV'
        }
    }

    return <div className={styles.MoveFile}>
        <input type='hidden' id='activeCat' value={String(activeCat.id)} />
        {activeCat ? <span>{label} {activeCat.name}</span> : ""}
        {Object.keys(categories).map(key => {
            const category = categories[key]
            return <div style={{ marginBottom: '0.5rem' }} key={categories[key]['id']} >
                <MoveFileCat
                    category={category} depth={0}
                    setActiveCat={setActiveCat}
                    activeCat={activeCat}
                    type={type}
                    id={id}
                />
            </div>
        })}
    </div>
}

export default MoveFile