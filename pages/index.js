import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getServerSession } from 'next-auth'

import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import LoadingFilesIndicator from '@/components/LoadingFilesIndicator/LoadingFilesIndicator'

const explore = (props) => {

    const router = useRouter()

    const [searchResults, setsearchResults] = useState({})
    const [trendingResults, settrendingResults] = useState({movies: [], shows: []})

    let searchTimeout

    const search = query => {
        clearTimeout(searchTimeout)

        searchTimeout = setTimeout(() => {
            router.replace({
                query: {
                    query: query
                }
            })
    
            fetch (`/api/search/streams?query=${query}`)
            .then (results => results.json())
            .then (data => {
                setsearchResults(data)
            })
            .catch(e => {
                if (e.code === DOMException.ABORT_ERR) {}
                else {
                    throw (e)
                }
            })
        }, 250)
    }

    const renderFile = (title, imdbid, year, type, posterURL, index) => {
        return <div 
            className="exploreResult"                 
            key={imdbid}
            style={{animation: `fadeIn 0.75s ${index * 0.025}s ease forwards`, width: 'min-content'}}
        >
            <Link 
                href = {{
                    pathname: `/stream/${imdbid}`,
                }}
                className='file exFile'
                style={{
                    color: 'rgba(0,0,0,0)', 
                }}
                tabIndex='0'
                data-filename={decodeURIComponent(title)}
            >
                <div 
                    className='filePoster' 
                    style={{
                        backgroundImage: 'url("' + posterURL + '")',
                        opacity: '1',
                        transform: 'scale(1)'
                    }}
                />
                <span className='title'>{title}</span>
                {/* <span className='seriesTitle'>{seriesTitle}</span> */}
            </Link>

            <h3 className='resultTitle'>{title}</h3>
            <span className='resultYear'>{year}</span>
        </div>
    }

    useEffect(() => {
        fetch('/api/search/trending')
        .then(response => response.json())
        .then(data => {
            settrendingResults(data)
        })
        
        if (props.query !== '') {
            document.querySelector('.exploreSearch').value = props.query
            search(props.query)
        }
    }, [])

    useEffect(() => {
        document.querySelectorAll('.files').forEach(filesItem => {
            const width = filesItem.clientWidth
            filesItem.style.cssText = `
                display: flex;
                transform-origin: left top;
                transform: scale(${width / 1700});
            `
        })
    }, [trendingResults])
    
    

    return (
        <>
            <div className='exploreTopContainer'>
                <img src='/images/lidoWhite.svg' />
                <div className='searchContainer'>
                    <input 
                        type='text' 
                        name='search' 
                        className='exploreSearch search use-keyboard-input' 
                        onKeyUp={e => {search(e.target.value)}}
                        placeholder="Search for movies or TV shows..."
                    />
                    <FontAwesomeIcon icon={faSearch} className='searchIcon' />
                </div>
            </div>

            {searchResults.Search ? <div className='files'>
                {searchResults.Search ? searchResults.Search.map((result, index) => {
                    if (result.Type == 'movie' || result.Type == 'series') {
                        if (result.Poster && result.Poster != "N/A") {
                            return renderFile(result.Title, result.imdbID, result.Year, result.Type, result.Poster, index)
                        }
                    }
                }) : ''}
            </div> 

            : <>
                <h1>Trending Movies</h1>
                {trendingResults.movies.length ? <div className='files'>
                    {trendingResults.movies.map((media, index) => {
                        return renderFile(media.title, media.imdbID, '', 'movie', media.poster, index)
                    })}
                </div> : <LoadingFilesIndicator />
                }
                
                <h1>Trending Shows</h1>
                {trendingResults.shows.length ? <div className='files'>
                    {trendingResults.shows.map((media, index) => {
                        return renderFile(media.title, media.imdbID, '', 'series', media.poster, index)
                    })}
                </div> : <LoadingFilesIndicator />
                }
                
            </> }   
        </>
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

    return {
        props: {
            query: context.query.query ? context.query.query : ''
        }
    }
}

export default explore