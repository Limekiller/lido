import styles from './VideoPlayer.module.scss'
import videojs from 'video.js'
import { Component } from 'react'
import { faTrash, faTimesCircle, faDownload, faFont } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Router from 'next/router'
import AppContext from '@/components/AppContext.js'
import Message from '@/components/MessageContainer/Message/Message.js'

class VideoPlayer extends Component {

    static contextType = AppContext

    constructor(props) {
        super(props);
        this.state = ({
            data: {},
            title: this.getTitle()[0],
            strippedTitle: this.getTitle()[1],
            showOverlay: true,
            hash: null
        })
    }


    componentDidMount() {
        // instantiate Video.js
        this.getMovieData()
        this.player = videojs(this.videoNode, this.props);
        const pauseHandler = this.player.on('pause', () => {
            if (!this.player.seeking()) {
                this.showOverlay()
            }
        })
        const errorHandler = this.player.on('error', () => {
            // this.context.globalFunctions.createMessage(
            //     <Message>
            //         <h1>Can't play the file :(</h1>
            //         <p>
            //             The browser is not able to play the file.
            //             This is most likely because the video is in a format the browser does not support.
            //             Try using the download button to download the file locally, and play it using VLC or some other media player.
            //             Sorry!
            //         </p>
            //         <button onClick={this.context.globalFunctions.closeMessage}>Okay</button>
            //     </Message>
            // )
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
                this.setState({ hash: data.hash })
                setTimeout(() => {
                    this.player.src({
                        src: `/api/getVideo?range=0&path=${encodeURIComponent(data.dest)}`,
                        type: 'video/mp4'
                    })
                    this.player.load()
                    this.player.on('ended', () => {
                        const currTime = this.player.currentTime()
                        this.player.load()
                        this.player.currentTime(currTime)
                        this.hideOverlay()
                    })
                }, 2000)
            })
        })

        // Router.push('/?video=true')
    }

    // destroy player on unmount
    componentWillUnmount() {
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

    getTitle = () => {
        let title = this.props.path.split('/').slice(-1).join()
        let strippedTitle = title.split('.').slice(0, -1).join('.')
        return [title, strippedTitle]
    }

    getMovieData = async () => {
        let data = await fetch('/api/getMovieData?title=' + this.state.title)
        this.setState({ data: await data.json() })
    }

    downloadMovie = () => {
        window.location.href = '/api/getVideo?download=true&path=' + encodeURIComponent(this.props.path)
    }

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

    showOverlay = () => {
        this.setState({ showOverlay: true })
    }
    hideOverlay = () => {
        this.setState({ showOverlay: false })
        this.player.play()
    }

    render() {

        const renameFileMessage = 
                        <Message>
                            <h1>Rename File</h1>
                            <input type='text' id='rename' onKeyDown={(e) => {e.keyCode == 13 ? this.renameFile(document.querySelector('#rename').value) : '' }}/><br />
                            <button onClick={() => this.renameFile(document.querySelector('#rename').value)}>Submit</button>
                            <button onClick={this.context.globalFunctions.closeMessage}>Cancel</button>
                        </Message>
        return (
            <div className={styles.videoPlayer}>
                <FontAwesomeIcon 
                    icon={faTimesCircle} 
                    className={styles.close}
                    onClick={() => this.context.globalFunctions.closeMessage()}
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
                            <img 
                                src='/images/icons/playButton.svg' 
                                onClick={() => this.hideOverlay()}
                            />
                            <FontAwesomeIcon 
                                icon={faFont}
                                onClick={() => this.context.globalFunctions.createMessage(renameFileMessage)}
                            />
                            <FontAwesomeIcon 
                                icon={faTrash}
                                onClick={() => this.deleteFile()}
                            />
                            <FontAwesomeIcon 
                                icon={faDownload}
                                onClick={() => this.downloadMovie()}
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
                        //preload="auto"
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
