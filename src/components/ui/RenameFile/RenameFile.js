"use client"

import styles from './RenameFile.module.scss'

const RenameFile = ({
    id,
    name = null
}) => {
    return <div className={styles.RenameFile}>
        {name ? <span style={{ 
            color: "var(--fg-color-light)",
            display: 'block',
            margin: '-1rem 0 1rem 0'
        }}>
            {name}
        </span> : ""}
        <label htmlFor='fileRename'>Name</label><br />
        <input
            type='text'
            name='fileRename'
            id='fileRename'
            onKeyDown={e => {
                if (e.code === "Enter") {
                    e.target.closest('.messageParent').querySelector('.messageSubmit').click()
                }
            }}
        />
    </div>
}

export const renameFile = async id => {
    const name = document.querySelector('#fileRename').value
    let response = await fetch(`/api/file/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name
        })
    })

    if (response.status === 200) {
        window.location.reload()
    }
}

export default RenameFile