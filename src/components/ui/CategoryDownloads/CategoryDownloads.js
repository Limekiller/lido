import styles from './CategoryDownloads.module.scss'

const CategoryDownloads = ({ downloads }) => {
    return <>
        <div className={styles.CategoryDownloads}>
            <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                <span className="material-icons">cloud_download</span>
                <span>Downloads in progress</span>
            </div>
            <div className={styles.downloads}>
                {downloads.map(download => {
                    return <div className={styles.download} key={download.id}>
                        {download.name}
                    </div>
                })}
            </div>
        </div>
    </>
}

export default CategoryDownloads