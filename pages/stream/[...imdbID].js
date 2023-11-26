import { useEffect, useState, useContext } from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'

import AppContext from '@/components/AppContext.js'
import VideoPlayer from '@/components/MessageContainer/VideoPlayer/VideoPlayer'
import Search from '@/components/Search/Search'

const ExploreCard = (props) => {

    const context = useContext(AppContext)
    const [torrents, settorrents] = useState([])
    const [episodes, setepisodes] = useState({})
    const [viewingSeason, setviewingSeason] = useState(1)

    /**
     * Gets a list of torrents for this media
     */
    const getTorrents = async () => {
        if (props.data.Type === 'series') {
            settorrents([])
            return
        }

        const title = props.data.Type == 'episode' ? props.data.showTitle : props.data.Title

        let torrentAPIURL = `/api/search/torrents?search=${title}`
        if (props.data.Season && props.data.Episode) {
            const season = props.data.Season < 10 ? '0' + props.data.Season : props.data.Season
            const episode = props.data.Episode < 10 ? '0' + props.data.Episode : props.data.Episode
            torrentAPIURL += `+S${season}E${episode}`
        } else {
            torrentAPIURL += `+${props.data.Year}`
        }
        
        let torrents = await fetch(torrentAPIURL)
        torrents = await torrents.json()
        settorrents(torrents)
    }

    /**
     * Gets a list of seasons and episodes if this is a show
     */
    const getEpisodes = async () => {
        let tempEpisodes = {}
        for (let i = 1; i <= props.data.totalSeasons; i++) {
            let episodeList = await fetch(`/api/moviedata/episodes?imdbid=${props.data.imdbID}&season=${i}`)
            episodeList = await episodeList.json()
            tempEpisodes[i] = episodeList.Episodes
        }
        setepisodes(tempEpisodes)
    }

    /**
     * Based on a scroll listener, set the state for which season we're looking at
     */
    const setViewingSeason = () => {
        for (let i = Object.entries(episodes).length; i > 0; i--) {
            const seasonContainer = document.querySelector(`#season${i}`)
            const rect = seasonContainer.getBoundingClientRect()

            if (rect.bottom > 0 &&
              rect.right > 0 &&
              rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
              rect.top < (window.innerHeight || document.documentElement.clientHeight)) {
                setviewingSeason(i)
                return
            }
        }
    }

    useEffect(() => {
        getTorrents()
        getEpisodes()
    }, [props.data])

    useEffect(() => {
        if (Object.entries(episodes).length > 0) {
            document.querySelector('.seasons').addEventListener('scroll', setViewingSeason)
        }
    }, [episodes])

    return (
        <div className='imdbIDContainer'>
            <Search />
            <div
                className='background'
                style={{
                    backgroundImage: `url('${props.data.Poster}')`
                }}
            />
            <div className='layout'>
                <div className='col1'>
                    <img
                        className='poster'
                        src={props.data.Poster}
                        alt={`Movie poster for ${props.data.Title}`}
                    />
                </div>

                <div className='col2'>
                    <div className='info'>
                        <h1 className='pageTitle'>{props.data.Title}</h1>
                        <div className='subline yearAndGenre'>
                            <h1>{props.data.Year}</h1>
                            <h3 className='genre'>{props.data.Genre}</h3>
                        </div>
                        <div className='subline'>
                            <h3 className='actors'>{props.data.Actors}</h3>
                            <div className='subline'>
                                <div className='runtime'>
                                    <FontAwesomeIcon icon={faClock} />
                                    <h3>{props.data.Runtime}</h3>
                                </div>
                                <span className='rating'>{props.data.Rated}</span>
                            </div>
                        </div>
                        <p className='plot'>{props.data.Plot}</p>
                    </div>
                </div>
            </div>

            {/* Create a list of seasons and episodes if this is a "series" */}
            {props.data.Type === 'series' ? <div className='seasons torrents'>
                <div className='seasonList'>
                    {Object.entries(episodes).map(season => {
                        return <button 
                            className='unstyled' 
                            onClick={(e) => { document.querySelector(`#${e.target.dataset.season}`).scrollIntoView({behavior: 'smooth'}) }}
                            data-season={`season${season[0]}`} 
                            key={season[0]}
                        >
                            <h1 
                                style={{pointerEvents: 'none'}}
                                className={viewingSeason == season[0] ? 'viewing' : ''}
                            >
                                Season {season[0]}
                            </h1>
                        </button>
                    })}
                </div>

                <div className='episodeList'>
                    {Object.entries(episodes).map(season => {
                        return <div className='season' id={`season${season[0]}`} key={`episode${season[0]}`}>
                            <h3 className='seasonLabel'>Season {season[0]}</h3>
                            {season[1].map(episode => {
                                return <Link
                                        href={`/stream/${episode.imdbID}?show=${props.data.Title}`}
                                        className='episode torrent highlight'
                                        key={episode.Title}
                                    >
                                        <b>{episode.Episode}</b><span style={{padding: "0 0.25rem"}}> • </span>{episode.Title}
                                    </Link>
                            })}
                            {season[0] == Object.entries(episodes).length ? '' : <div className='seasonDivider'></div> }
                        </div>
                    })}
                </div>

            {/* If this is a movie or episode, show a list of torrents */}
            </div> : <div className='torrents'>
                <h1>Stream List</h1>
                {props.data.Type === 'episode' ? <p style={{marginTop: '-1rem'}}>
                    Often, a single episode of a TV show does not have enough seeders to stream reliably. <br /> If you're having trouble streaming an episode, try using the download feature instead to download an entire season.
                </p> : ''}
                {torrents.map(torrent => {
                    return <button
                        className='torrent unstyled highlight'
                        key={torrent.name}
                        onClick={() => context.globalFunctions.createMessage(
                            <VideoPlayer stream={true} magnet={torrent.link} title={torrent.name} data={props.data} />
                        )}
                    >
                        <p>{torrent.name}</p>
                        <div className='peers'>
                            <span className='seeders'>{torrent.seeders}</span>
                            <span className='leechers'>{torrent.leechers}</span>
                        </div>
                    </button>
                })}
            </div>}

        </div>
    )
}

export async function getServerSideProps(context) {
    const session = await getServerSession(context.req, context.res)

    if (typeof window === "undefined" && context.res.writeHead) {
        if (!session) {
            context.res.writeHead(302, { Location: "/api/auth/signin" });
            context.res.end();
            return
        }
    }

    // Get the full data for the media from the passed IMDB ID
    let fullData = await fetch(`https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${context.query.imdbID}`)
    fullData = await fullData.json()

    // If this is an episode, see if we were already passed the title from the previous page
    // We need the title so we can search for torrents, but we don't want to have to do two network requests if we don't have to,
    // so the title is passed in a query param if the episode was clicked on
    // But if we don't have the title (somebody went to this page directly, maybe?) we get it from OMDB
    if (fullData.Type == 'episode') {
        let showTitle = context.query.show
        if (!showTitle) {
            let showData = await fetch(`https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${fullData.seriesID}`)
            showData = await showData.json()
            showTitle = showData.Title
        }
        fullData.showTitle = showTitle
    }

    return {
        props: {
            data: fullData,
        }
    }
}

export default ExploreCard