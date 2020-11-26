import styles from './VideoPlayer.module.scss'
import videojs from 'video.js'
import { Component } from 'react'
import { faTrash, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class VideoPlayer extends Component {

    constructor(props) {
        super(props);
        this.state = ({
            data: {},
            title: this.getTitle()[0],
            strippedTitle: this.getTitle()[1]
        })
    }


    componentDidMount() {
        // instantiate Video.js
        this.getMovieData()
        this.player = videojs(this.videoNode, this.props);
    }

    // destroy player on unmount
    componentWillUnmount() {
        if (this.player) {
            this.player.dispose()
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

    render() {

        return (
            <div className={styles.videoPlayer}>
                <FontAwesomeIcon 
                    icon={faTimesCircle} 
                    className={styles.close}
                    onClick={() => this.props.closeMessage()}
                />

                <div className={styles.overlay}>
                    <div className={styles.overlayBg} />
                    <h1>{this.state.strippedTitle}</h1>
                    <h3>{this.state.data.Year}</h3>
                    <p>{this.state.data.Plot}</p>

                    <div className={styles.videoOptions}>
                        <img src='/images/icons/playButton.svg' />
                        <FontAwesomeIcon icon={faTrash} />
                    </div>

                    <style jsx>{`
                        .${styles.overlayBg} {
                            background: ${this.state.data.Poster != 'N/A' ? 'url("' + this.state.data.Poster + '")' : 'linear-gradient(to right, $fg-color-dark, rgba(0,0,0,0))'};
                        }
                    `}</style>
                </div>
                <div data-vjs-player>
                    <video 
                        className='video-js'
                        //preload="auto"
                        controls
                        autoPlay='autoplay'
                        ref={ node => this.videoNode = node }
                    >
                        <source src={'/api/getVideo?range=0&path=/' + encodeURIComponent(this.props.path)} type="video/mp4" />
                    </video>
                </div>


            </div>
        )
    }
}

export default VideoPlayer
