import { Component } from 'react'
import styles from './PosterBg.module.scss'

class PosterBg extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            numCols: 9,
            numRows: 4,
            offset: 17,
            time: 120

        };
    }

    componentDidMount = () => {
        this.setState({
            numCols: window.innerWidth / (window.innerHeight / 4.5),
            numRows: 4,
            offset: (Math.round(window.innerHeight / 10) / 4),
            time: Math.round(window.innerHeight / 10)
        })

        setTimeout(() => {
            const numPosters = document.querySelectorAll('.' + styles.poster).length;
            fetch('/api/getRandomPoster?number=' + numPosters)
            .then(response => response.json())
            .then(data => {
                document.querySelectorAll('.' + styles.poster).forEach((poster, i) => {
                    // Load the image into a new element so we can use a load listener to know when to make the poster opaque
                    const src = `/images/posters/${data[i]}`
                    const img = new Image();
                    img.addEventListener('load', () => {
                        poster.style.opacity = 1;
                        poster.style.backgroundImage = 'url("/images/posters/' + data[i] + '")'
                    })
                    img.src = src;
                })
            })
        }, 500)
    }

    render() {
        let content = [];
        for (let i=0; i<this.state.numCols; i++) {
            let innerContent = []
            const reverse = i % 2 == 0 ? '' : 'reverse'
            for (let j = 0; j < this.state.numRows; j++) {
                innerContent.push(<div key={j} className={styles.poster} style={{ animation: styles.posterUp + ' ' + this.state.time + 's -' + (j * this.state.offset) + 's linear ' + reverse + ' infinite' }}/>);
            }
            content.push(<div key={i} className={styles.posterTrack}>{innerContent}</div>)
        }

        return (
            <div className={styles.loginBg}>
                {content}
            </div>
        )
    }
}

export default PosterBg
