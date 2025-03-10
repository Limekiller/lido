import { redirect } from 'next/navigation'
import styles from './browse.module.scss'

import searchProviders from '@/lib/searchProviders/searchProviders'
import DownloadResultList from '@/components/ui/DownloadResultList/DownloadResultList'

const page = async ({ params }) => {
    const { imdbid } = await params

    let metadata = await fetch(`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${imdbid}`)
    
    try {
        metadata = await metadata.json()
    } catch (error) {
        redirect('/')
    }

    const torrents = searchProviders._1337x(metadata.Title)

    return <div className={styles.Browse}>
        <div 
            className={styles.header}
            style={{
                backgroundImage: `url(${metadata.Poster})`,
            }}
        >
            <div className={styles.details}>
                <img src={metadata.Poster} />
                <div style={{width: '100%'}}>
                    <h1 className={`title ${styles.title}`}>{metadata.Title}</h1>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <h2>{metadata.Year}</h2>
                        <h2>{metadata.Genre}</h2>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span>{metadata.Actors}</span>
                        <div style={{display: 'flex', gap: '1rem'}}>
                            <span className={styles.runtime}>{metadata.Runtime}</span>
                            <span className={styles.rated}>{metadata.Rated}</span>
                        </div>
                    </div><br />
                    <p style={{width: '66%'}}>{metadata.Plot}</p>
                </div>
            </div>
        </div>

        <DownloadResultList results={torrents} /> 
    </div>
}

export default page