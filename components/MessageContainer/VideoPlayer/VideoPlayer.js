import styles from './VideoPlayer.module.scss'
import videojs from 'video.js'
import { Component } from 'react'
import { faTrash, faTimesCircle, faDownload, faFont } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Router from 'next/router'
import AppContext from '@/components/AppContext.js'
import Message from '@/components/MessageContainer/Message/Message.js'

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
            data: {},
            title: this.getTitle()[0],
            strippedTitle: this.getTitle()[1],
            showOverlay: true,
            hasShownConvertMessage: false,

            hash: null,
            hasConverted: false
        })
    }


    async componentDidMount() {
        this.getMovieData()

        // instantiate Video.js
        this.player = videojs(this.videoNode, this.props);
        const pauseHandler = this.player.on('pause', () => {
            if (!this.player.seeking()) {
                this.showOverlay()
            }
        })

        // If we get a playback error or one of the codecs isn't supported, ask if we should convert the file
        const convertMessage =
        <Message>
            <h1>Convert File?</h1>
            <p>This file can't be played by your current browser. You can click OK to convert the file in real-time for playback, or click cancel for other options. You may want to download the file locally, or try with a different browser.</p>
            <button onClick={() => {this.createStream(); this.context.globalFunctions.closeMessage()}}>OK</button>
            <button onClick={this.context.globalFunctions.closeMessage}>Cancel</button>
        </Message>
        const errorHandler = this.player.on('error', () => {
            if (!this.state.hasShownConvertMessage) {
                this.context.globalFunctions.createMessage(convertMessage)
                this.setState({hasShownConvertMessage: true})
            }
        })
        const codecs = await this.getCodecs()
        if (!this.state.hasShownConvertMessage && (!supportedCodecs.video.includes(codecs.video) || !supportedCodecs.audio.includes(codecs.audio))) {
            this.context.globalFunctions.createMessage(convertMessage)
            this.setState({hasShownConvertMessage: true})
        }
        
        document.addEventListener('keydown', this.onKey);
        document.addEventListener('mousemove', this.onMouseMove);
    }

    // destroy player on unmount
    componentWillUnmount() {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('keydown', this.onKey);
        if (this.player) {
            this.player.dispose()
            if (this.state.hash) {
                fetch('/api/streamActions', {
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
     * Checks key presses and fires appropriate event
     * 
     * @param {event} e
     */
    onKey = e => {
        document.querySelector('.vjs-control-bar').classList.add('tv-control')
        if (!this.state.showOverlay) {
            if (e.code == 'Enter' && !e.target.classList.contains('mainPlayButton')) {
                this.showOverlay();
                this.player.pause();
            } else  {
                this.player.reportUserActivity(e)
                const currTime = this.player.currentTime();
                if (e.code == 'ArrowLeft') {
                    this.player.currentTime(currTime - 10);
                } else if (e.code == 'ArrowRight') {
                    this.player.currentTime(currTime + 10);
                }
            }
        }
    }

    onMouseMove = e => {
        document.querySelector('.vjs-control-bar').classList.remove('tv-control')
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
            fetch('/api/streamActions', {
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
        const codecs = await fetch(`/api/streamActions?source=${window.location.pathname}&name=${this.state.title}`)
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
        let data = await fetch('/api/getMovieData?title=' + this.state.title)
        this.setState({ data: await data.json() })
    }

    /**
     * Helper function to trigger a browser download of the file
     */
    downloadMovie = () => {
        window.location.href = '/api/getVideo?download=true&path=' + encodeURIComponent(this.props.path)
    }

    /**
     * Helper function to delete the file
     */
    deleteFile = () => {
        fetch('/api/folderActions', {
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
        fetch('/api/folderActions', {
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
        this.setState({ showOverlay: true })
        // Every time we show the overlay, we should move focus to the play button
        SpatialNavigation.focus(document.querySelector('.mainPlayButton'))
    }
    hideOverlay = () => {
        // However, we always want the video to start playing when the overlay is hidden
        this.setState({ showOverlay: false })
        this.player.play()
    }

    render() {

        const renameFileMessage =
            <Message>
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
                `}
            >
                <FontAwesomeIcon
                    icon={faTimesCircle}
                    className={`
                        video-close
                        selectable
                        ${styles.close}
                        ${!this.state.showOverlay ? 'display-none' : ''}
                    `}
                    onClick={() => this.context.globalFunctions.closeMessage()}
                    onKeyDown={e => {if (e.key === 'Enter') { this.context.globalFunctions.closeMessage() }}}
                />
                <div data-vjs-player>
                    <div
                        className={`
                            ${styles.overlay}
                            ${!this.state.showOverlay ? styles.hidden : ''}
                        `}>
                        <div className={styles.overlayBg} />
                        <h1>{this.state.data.Title ? this.state.data.Title : this.state.strippedTitle}</h1>
                        <h3>{this.state.data.Year}</h3>
                        <p>{this.state.data.Plot}</p>
                        <p className={styles.note}>
                            Film information is retrieved based on the filename.<br />
                            If this information is not correct, try renaming the file.
                        </p>

                        <div className={styles.videoOptions}>
                            <button 
                                className='link mainPlayButton'
                                onKeyDown={e => {if (e.key === 'Enter') { this.hideOverlay() }}}
                            >
                                <img
                                    src='/images/icons/playButton.svg'
                                    onClick={() => this.hideOverlay()}
                                />
                            </button>
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
                        </div>

                        <style jsx>{`
                            .${styles.overlayBg} {
                                background: ${this.state.data.Poster != 'N/A' ? 'url("' + this.state.data.Poster + '")' : 'linear-gradient(to right, $fg-color-dark, rgba(0,0,0,0))'};
                            }
                        `}</style>
                    </div>
                    <video
                        className='video-js'
                        preload="auto"
                        id='video'
                        controls
                        autoPlay='autoplay'
                        ref={ node => this.videoNode = node }
                    >
                        <source src={'/api/getVideo?range=0&path=' + encodeURIComponent(this.props.path)} type="video/mp4" />
                    </video>
                </div>
            </div>
        )
    }
}

export default VideoPlayer
