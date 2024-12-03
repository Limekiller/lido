import { Component } from 'react'
import Router from 'next/router'
import Link from 'next/link'

import videojs from 'video.js'
import { faTrash, faUsers, faDownload, faFont, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import AppContext from '@/components/AppContext.js'
import Message from '@/components/MessageContainer/Message/Message.js'
import CaptionIndicator from './CaptionIndicator/CaptionIndicator'

import styles from './VideoPlayer.module.scss'

const supportedCodecs = {
    video: [
        'h264',
        'av1',
        'theora'
    ],
    audio: [
        'aac',
        'flac',
        'mp3',
        'opus',
        'vorbis'
    ]
}

class VideoPlayer extends Component {

    static contextType = AppContext

    constructor(props) {
        super(props);

        this.state = ({
            data: this.props.data || {},
            title: this.props.title || this.getTitle()[0],
            strippedTitle: this.props.title || this.getTitle()[1],
            showOverlay: this.props.stream ? false : true,
            overlayLock: false,

            // info related to "next video" feature
            parentFiles: this.props.files || [],
            nextVideoTriggered: false,
            nextVideoData: null,
            nextVideoTimeout: null,

            // caption information
            captions: false,
            captionState: 'error',
            filesize: 0,
            moviehash: 0,

            // conversion information
            hasShownConvertMessage: false,
            hash: null,
            hasConverted: false,
        })
    }

    async componentDidMount() {
        let fsData = await fetch(`/api/moviedata/filesize?path=${this.props.path}`)
        fsData = await fsData.json()
        this.setState({...this.state, filesize: fsData.filesize, moviehash: fsData.moviehash})
        
        for (let i in this.props.files) {
            if (this.props.files[i].name == this.state.title && this.props.files[parseInt(i) + 1]) {
                let _nextVideoData = this.props.files[parseInt(i) + 1].data
                _nextVideoData['name'] = this.props.files[parseInt(i) + 1].name
                this.setState({nextVideoData: _nextVideoData})
                break
            }
        }

        // duplicate the page on the history stack so if the user hits the back button, they stay on the same page
        if (!this.props.partyMode) {
            const url = new URL(window.location);
            window.history.pushState({}, '', url)
            Router.events.on('routeChangeStart', this.context.globalFunctions.closeAllMessages)
        }
        window.addEventListener('popstate', this.onBackEvent)

        // instantiate Video.js
        this.player = videojs(this.videoNode)
        this.player.on('pause', () => {
            if (!this.player.seeking()) {
                if (this.props.partyListeners) {
                    this.props.partyListeners.pause()
                }
                this.showOverlay()
            }
        })
        this.player.on('play', () => {
            if (!this.player.seeking()) {
                if (this.props.partyListeners) {
                    this.props.partyListeners.play()
                }
                this.hideOverlay()
            }
        })
        this.player.on('seeked', () => {
            if (this.props.partyListeners) {
                this.props.partyListeners.seek(this.player.currentTime())
            }
        })
        this.player.on('timeupdate', () => {
            this.checkNextVideoTrigger(this.player.duration() - this.player.currentTime())
        })

        // If we get a playback error or one of the codecs isn't supported, ask if we should convert the file
        const convertMessage =
        <Message>
            <h1>Convert File?</h1>
            <p>This file can't be played by your current browser. You can click OK to convert the file in real-time for playback, or click cancel for other options. You may want to download the file locally, or try with a different browser. Note that subtitles will not be available in real-time conversion mode.</p>
            <button onClick={() => {this.createStream(); this.context.globalFunctions.closeMessage()}}>OK</button>
            <button onClick={this.context.globalFunctions.closeMessage}>Cancel</button>
        </Message>
        // Alternatively, if we're trying to stream a torrent and get an error, we just inform the user that this ain't gonna work
        const invalidMessage =
        <Message>
            <h1>Invalid media format</h1>
            <p>Unfortunately, your browser can't play the type of video in this torrent. You can try a different torrent, use a different browser, or save the movie or episode to the server to watch later.</p>
            <button onClick={this.context.globalFunctions.closeAllMessages}>OK</button>
        </Message>
        const errorHandler = this.player.on('error', () => {
            if (!this.props.stream && !this.state.hasShownConvertMessage && !this.props.partyMode) {
                this.context.globalFunctions.createMessage(convertMessage)
                this.setState({hasShownConvertMessage: true})
            } else if (this.props.stream) {
                this.context.globalFunctions.createMessage(invalidMessage)
            }
        })

        if (Object.entries(this.state.data).length === 0) {
            this.getMovieData()
        } else {
            this.getSubtitles(parseInt(this.state.data.imdbID.slice(2), 10))
            this.player.play()
            setTimeout(() => document.querySelector('.vjs-big-play-button').click(), 250)
        }
        
        SpatialNavigation.disable('add');
        document.addEventListener('keydown', this.onKey);
        document.addEventListener('mousemove', this.onMouseMove);
    }

    // destroy player on unmount
    componentWillUnmount() {
        Router.events.off('routeChangeStart', this.context.globalFunctions.closeAllMessages)
        SpatialNavigation.enable('add');

        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('keydown', this.onKey);
        document.removeEventListener('popstate', this.onBackEvent);

        if (this.player) {
            this.player.dispose()
            if (this.state.hash) {
                fetch('/api/stream', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        hash: this.state.hash,
                    })
                })
            }
        }
    }

    /**
     * Explicit pause function for party mode
     */
    pauseVideo = () => {
        this.player.pause()
    }
    /**
     * Explicit play function for party mode
     */
    playVideo = () => {
        this.setState({ showOverlay: false })
        this.props.partyListeners.seek(this.player.currentTime())
        this.player.play()
    }
    /**
     * Explicit seek function for party mode
    */
    seekVideo = time => {
        this.player.currentTime(time)
    }

    /**
     * If the given amount of time left in the video is less than some value,
     * we find the next file in the current folder (by looking through the passed files prop)
     * create a new VideoPlayer component message in front of the message stack, and then pop the last one (ie, this one)
     * @param {float} timeLeft: The amount of time left in the video
     */
    checkNextVideoTrigger = (timeLeft) => {
        if (timeLeft < 15 && this.state.nextVideoTriggered == false && this.state.nextVideoData.name) {
            this.setState({nextVideoTriggered: true})
            this.setState({nextVideoTimeout: setTimeout(() => {
                this.context.globalFunctions.createMessage(
                    <VideoPlayer 
                        files={this.props.files} 
                        path={window.location.pathname + '/' + this.state.nextVideoData.name}
                    />,
                    true
                )
                this.context.globalFunctions.closeMessage()
            }, 10E3)})
        }
    }
    cancelVideoTrigger = () => {
        clearTimeout(this.state.nextVideoTimeout)
        this.setState({nextVideoTimeout: null})
    }

    /**
     * Checks key presses and fires appropriate event
     * 
     * @param {event} e
     */
    onKey = e => {
        // TV input not supported in party mode yet
        if (this.props.partyMode) {
            return
        }

        this.cancelVideoTrigger()
        document.querySelector('.vjs-control-bar').classList.add('tv-control')
        if (!this.state.showOverlay) {
            if ((e.code == 'Enter' || e.code == 'Space') && !this.state.overlayLock) {
                this.showOverlay();
                this.player.pause();
            } else  {
                this.player.reportUserActivity(e)
                const currTime = this.player.currentTime();
                if (e.code == 'ArrowLeft') {
                    this.player.currentTime(currTime - 10);
                } else if (e.code == 'ArrowRight') {
                    this.player.currentTime(currTime + 10);
                } else if (e.code == 'ArrowUp') {
                    const captionState = this.state.captions ? 'disabled' : 'enabled'
                    this.context.globalFunctions.createToast('notify', `Captions ${captionState}`)
                    document.querySelector('.vjs-subs-caps-button').click()
                }
            }
        }
    }

    onMouseMove = e => {
        this.cancelVideoTrigger()
        document.querySelector('.vjs-control-bar').classList.remove('tv-control')
    }
    onBackEvent = e => {
        e.preventDefault()
        this.context.globalFunctions.closeMessage() 
    }

    /**
     * Helper function to create m3u8 stream
     */
    createStream = () => {
        // If we can't play the video, convert it to a fragmented MP4
        // and start playback asap
        if (!this.state.hasConverted) {
            this.context.globalFunctions.createToast(
                'notify',
                'Please wait, converting file to a format compatible with your browser.',
                10000
            )
            fetch('/api/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source: window.location.pathname,
                    name: this.state.title
                })
            })
            .then(response => response.json())
            .then(data => {
                setTimeout(() => {
                    this.setState({ hash: data.hash })
                    this.player.src({
                        src: `/streams/${data.hash}/${data.hash}.m3u8`,
                        type: 'application/x-mpegURL'
                    })
                }, 5000)
            })
        }
        this.setState({ hasConverted: true })
        this.player.reset()
    }

    /**
     * Helper function to get the codec information of the file
     * 
     * @returns {JSON obj} The video and audio codecs of the file
     */
    getCodecs = async () => {
        const codecs = await fetch(`/api/stream?source=${this.props.path.split('/').slice(0, -1).join('/')}&name=${this.state.title}`)
        return await codecs.json()
    }

    /**
     * 
     * @returns {obj} The filename both including and excluding the filetype
     */
    getTitle = () => {
        let title = this.props.path.split('/').slice(-1).join()
        let strippedTitle = title.split('.').slice(0, -1).join('.')
        return [title, strippedTitle]
    }

    /**
     * Helper function to get the OMDB movie data, and update the component state
     */
    getMovieData = async () => {
        const encodedTitle = btoa(this.state.title)
        let data
        if (localStorage.getItem(encodedTitle) === null) {
            data = await fetch('/api/moviedata/data?title=' + encodeURIComponent(this.state.title))
            data = await data.json()
            this.setState({ data: data })
        } else {
            data = JSON.parse(localStorage.getItem(encodedTitle))
            this.setState({ data: data })
        }

        if (data.imdbID) {
            this.getSubtitles(parseInt(data.imdbID.slice(2), 10))
        }
    }

    /**
     * Helper function to get .vtt file
     */
    getSubtitles = (imdbID) => {
        this.setState({captionState: 'fetching'})
        fetch(`/api/subtitles?imdbid=${imdbID}&filesize=${this.state.filesize}&moviehash=${this.state.moviehash}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                this.player.addRemoteTextTrack({src: `/api/subtitles?link=${data.link}`}, false);
                this.setState({ captionState: 'ok' })
                document.querySelector('.vjs-subs-caps-button').addEventListener('click', (e) => {
                    document.querySelector('.vjs-subs-caps-button .vjs-menu-item[role="menuitemradio"]').click()
                    if (!this.state.captions) {
                        document.querySelector('.vjs-subtitles-menu-item').click()
                    }
                    this.setState({ captions: !this.state.captions })
                })
            } else {
                this.context.globalFunctions.createToast('error', 'Could not fetch subtitles!')
                this.setState({ captionState: 'error' })
            }
        })
        
    }

    /**
     * Helper function to trigger a browser download of the file
     */
    downloadMovie = () => {
        window.location.href = '/api/video?download=true&path=' + encodeURIComponent(this.props.path)
    }

    /**
     * Helper function to delete the file
     */
    deleteFile = () => {
        fetch('/api/path/resource', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: window.location.pathname,
                name: this.state.title
            })
        })
        .then(response => response.text())
        .then(data => {
            this.context.globalFunctions.closeMessage()
            this.context.globalFunctions.createToast('notify', 'File deleted!')
            Router.push(window.location.pathname)
        })
    }

    /**
     * Helper function to rename the file
     * 
     * @param {string} newTitle The title we want to rename the file to
     */
    renameFile = (newTitle) => {
        if (!newTitle) {
            this.context.globalFunctions.createToast('alert', 'Filename cannot be empty!')
            return
        }
        fetch('/api/path/resource', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currPath: window.location.pathname + '/' + this.state.title,
                destPath: window.location.pathname + '/' + newTitle + '.mp4',
                type: 'file'
            })
        })
        .then(response => response.text())
        .then(data => {
            window.location.href = window.location.pathname
        })
    }

    /**
     * Helper functions to show or hide the video overlay
     */
    showOverlay = () => {
        // We don't want to pause the video every time we show the overlay, 
        // because we call this method when the video first loads -- we want the overlay to show, but with the video playin in the background
        setTimeout(() => this.setState({ showOverlay: true }), 50)
        document.querySelector(`.${styles.overlay}`).style.display = 'unset'
        
        // Every time we show the overlay, we should move focus to the play button
        setTimeout(() => SpatialNavigation.focus(document.querySelector('.mainPlayButton')), 50)
    }
    hideOverlay = () => {
        this.setState({overlayLock: true})
        setTimeout(() => this.setState({overlayLock: false}), 150)
        // However, we always want the video to start playing when the overlay is hidden
        if (this.props.partyListeners) {
            this.props.partyListeners.play()
        }

        this.setState({ showOverlay: false })
        setTimeout(() => document.querySelector(`.${styles.overlay}`).style.display = 'none', 200)

        this.player.play()
    }

    render() {

        const renameFileMessage = <Message>
                <h1>Rename File</h1>
                <input type='text' className='use-keyboard-input' id='rename' onKeyDown={(e) => {e.keyCode == 13 ? this.renameFile(document.querySelector('#rename').value) : '' }}/><br />
                <button onClick={() => this.renameFile(document.querySelector('#rename').value)}>Submit</button>
                <button onClick={this.context.globalFunctions.closeMessage}>Cancel</button>
        </Message>

        return (
            <div 
                className={`
                    ${styles.videoPlayer}
                    ${!this.state.showOverlay ? '' : 'overlay'}
                    ${this.state.captions ? 'captions' : ''}
                    ${this.props.partyMode === 2 || this.props.partyMode === 4 ? styles.partyLoggedIn : ''}
                    ${this.props.partyMode > 2 ? styles.chatOpen : ''}
                    ${this.props.partyMode ? 'partyMode' : ''}
                `}
            >
                <div data-vjs-player>
                    {this.props.partyMode ? <a href="https://github.com/limekiller/lido" target="_blank"><img className={styles.lidoLogo} src='images/lidoWhite.svg' /></a> : ''}
                    <div
                        className={`
                            ${styles.overlay}
                            ${!this.state.showOverlay ? styles.hidden : ''}
                        `}>
                        <div className={styles.overlayBg} />
                        <h1 
                            style={{wordBreak: this.state.data.Title ? 'break-word' : 'break-all'}}
                        >
                            {this.state.data?.Type == 'episode' ? 
                                <>
                                    {this.state.data.seriesData?.Title || this.props.data.showTitle || this.state.data.Title}
                                    <span className={styles.episodeTitle}>S{this.state.data.Season}E{this.state.data.Episode} • {this.state.data.Title}</span>
                                </> :
                                this.state.data.Title || this.state.strippedTitle
                            }

                        </h1>
                        <h3>{this.state.data.Year}</h3>
                        <p>{this.state.data.Plot}</p>

                        {!this.props.stream ? 
                            <p className={styles.note}>
                                Film information and subtitles are retrieved based on the filename.<br />
                                If this information is not correct, try renaming the file.<br />
                                ({this.state.title})
                            </p>
                        : '' }

                        <div className={styles.videoOptions}>
                            <button 
                                className={`link mainPlayButton ${styles.mainPlayButton}`}
                                onKeyDown={e => {if (e.code === 'Enter') {this.hideOverlay()}}}
                            >
                                <img src='/images/icons/playButton.svg' onClick={() => this.hideOverlay()}/>
                            </button>
                            
                            {this.props.partyMode ? "" :
                            <button 
                                style={{
                                    background: "#6c6c6c", 
                                    color: 'white', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem', 
                                    borderRadius: '0.5rem', 
                                    padding: '0.5rem 1rem'
                                }}
                                onClick={() => this.context.globalFunctions.closeMessage()}  
                                onKeyDown={e => {if (e.key === 'Enter') { this.context.globalFunctions.closeMessage() }}} 
                            >
                                <span style={{transform: 'rotate(180deg)', fontSize: '1.75rem', marginTop: '0.5rem'}}>➜</span>
                                Back
                            </button>
                            }

                            {this.props.partyMode || this.props.stream ? "" :
                            <>
                                <FontAwesomeIcon
                                    icon={faFont}
                                    className='selectable'
                                    onClick={() => this.context.globalFunctions.createMessage(renameFileMessage)}
                                    onKeyDown={e => {if (e.key === 'Enter') { this.context.globalFunctions.createMessage(renameFileMessage) }}}
                                />
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className='selectable'
                                    onClick={() => this.deleteFile()}
                                    onKeyDown={e => {if (e.key === 'Enter') { this.deleteFile() }}}
                                />
                                <FontAwesomeIcon
                                    icon={faDownload}
                                    className='selectable'
                                    onClick={() => this.downloadMovie()}
                                    onKeyDown={e => {if (e.key === 'Enter') { this.downloadMovie() }}}
                                />
                                <Link href={`/party?path=${this.props.path}`}>
                                    <FontAwesomeIcon
                                        icon={faUsers}
                                        className='selectable'
                                    />
                                </Link>
                            </>
                            }     
                        </div>

                        <div className='CIWrapper' onClick={() => this.state.captionState === 'error' ? this.getSubtitles(parseInt(this.state.data.imdbID.slice(2), 10)) : ""}>
                            <CaptionIndicator state={this.state.captionState} />
                        </div>

                        <style jsx>{`
                            .${styles.overlayBg} {
                                background: ${this.state.data.Poster != 'N/A' ? 'url("' + this.state.data.Poster + '")' : 'linear-gradient(to right, $fg-color-dark, rgba(0,0,0,0))'};
                            }
                        `}</style>
                    </div>

                    {this.state.nextVideoTriggered && this.state.nextVideoTimeout ? 
                        <div className={styles.nextVideoButton}>
                            <span><b>Up next:</b> {
                                this.state.nextVideoData.Type == 'episode' ? 
                                `S${this.state.nextVideoData.Season}E${this.state.nextVideoData.Episode} ${this.state.nextVideoData.Title}` :
                                this.state.nextVideoData.Title || this.state.nextVideoData.name
                            }
                            </span>
                            <div className={styles.timer}></div>
                        </div> : ""
                    }

                    <video
                        className='video-js '
                        preload="auto"
                        id='video'
                        controls
                        autoPlay={this.props.partyMode ? '' : 'autoplay'}
                        ref={ node => this.videoNode = node }
                        crossOrigin="anonymous"
                    >
                        <source 
                            src={this.props.stream ? `/api/video?range=0&stream=1&magnet=${this.props.magnet}` 
                                : '/api/video?range=0&path=' + encodeURIComponent(this.props.path)
                            } 
                            type='video/mp4'
                        />
                    </video>
                </div>
            </div>
        )
    }
}

export default VideoPlayer
