import styles from './VideoPlayer.module.scss'
import videojs from 'video.js'
import { Component } from 'react'

class VideoPlayer extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // instantiate Video.js
        this.player = videojs(this.videoNode, this.props, function onPlayerReady() {
            console.log('onPlayerReady', this)
        });
    }

    // destroy player on unmount
    componentWillUnmount() {
        if (this.player) {
            this.player.dispose()
        }
    }

    render() {
        return (
            <div className={styles.videoPlayer}>
                <div data-vjs-player>
                    <video 
                        className='video-js'
                        //preload="auto"
                        controls
                        autoplay='autoplay'
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
