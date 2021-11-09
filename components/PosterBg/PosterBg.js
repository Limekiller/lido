import { Component } from 'react'
import styles from './PosterBg.module.scss'

class PosterBg extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            numCols: 8,
            numRows: 4,
            offset: 5,
            time: 20 
        };
    }

    componentDidMount = () => {
        this.setState({
            numCols: Math.round(window.innerWidth / 230) + 1,
            numRows: Math.round(window.innerHeight / 250),
            offset: Math.round(window.innerHeight / (this.state.numRows * window.innerHeight / 40)),
            time: Math.round(window.innerHeight / 25)
        })

        setTimeout(() => {
            const numPosters = document.querySelectorAll('.' + styles.poster).length;
            fetch('/api/getRandomPoster?number=' + numPosters)
            .then(response => response.json())
            .then(data => {
                document.querySelectorAll('.' + styles.poster).forEach((poster, i) => {
                    poster.style.backgroundImage = 'url("/images/posters/' + data[i] + '")'
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
