import { redirect } from 'next/navigation'
import styles from './browse.module.scss'

import searchProviders from '@/lib/searchProviders/searchProviders'
import DownloadResultList from '@/components/ui/DownloadResultList/DownloadResultList'

const getUSRating = data => {
    for (const release of data.release_dates.results) {
        if (release.iso_3166_1 === 'US') {
            for (const releaseItem of release.release_dates) {
                if (releaseItem.certification) {
                    return releaseItem.certification
                }
            }
        }
    }
}

const page = async ({ params }) => {
    const { type, tmdbid } = await params

    let metadata = await fetch(`https://api.themoviedb.org/3/${type}/${tmdbid}?append_to_response=release_dates`, {
        headers: {
            'Authorization': `Bearer ${process.env.TMDB_API_KEY}`
        }
    })
    if (metadata.status !== 200) {
        redirect('/')
    }
    metadata = await metadata.json()

    const year = (metadata.release_date || metadata.first_air_date).slice(0, 4)
    const searchString = `${metadata.name || metadata.title}+${type === 'movie' ? year : 'complete'}`
    const torrents = searchProviders._1337x(searchString)

    return <div className={styles.Browse}>
        <div
            className={`${styles.header} ${type === 'tv' ? styles.tv : ""}`}
            style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/w300_and_h450_bestv2/${metadata.poster_path})`,
            }}
        >
            <div className={styles.details}>
                <img src={`https://image.tmdb.org/t/p/w300_and_h450_bestv2/${metadata.poster_path}`} />
                <div style={{ width: '100%' }}>
                    <h1 className={`title ${styles.title}`}>{metadata.name || metadata.title}</h1>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>{metadata.release_date.slice(0, 4) || metadata.first_air_date.slice(0, 4)}</h2>
                        <p>
                            {metadata.genres.map((genre, index) => {
                                return <span key={genre.name}>{genre.name}{index < metadata.genres.length - 1 ? ',' : ''} </span>
                            })}
                        </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ width: '66%' }}>{metadata.overview}</p>
                        {type === 'movie' ?
                            <div style={{ display: 'flex', gap: '1rem', height: 'min-content' }}>
                                <span className={styles.runtime}>{metadata.runtime} min.</span>
                                <span className={styles.rated}>{getUSRating(metadata)}</span>
                            </div>
                            : ""
                        }
                    </div>
                </div>
            </div>
        </div>

        <DownloadResultList results={torrents} />
    </div>
}

export default page