import { Component } from 'react'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default class downloads extends Component {
    
    constructor(props) {
        super(props);
        this.state = { downloads: [] }
    }

    getDownloads = () => {
        fetch('/api/downloadActions', {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            this.parseDownloads(data);
        })
    }

    cancelDownload = (gid, path, name, e) => {
        e.target.parentElement.parentElement.classList.add('inactive')
        fetch('/api/downloadActions?gid=' + gid + '&path=' + path + '&name=' + name, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            this.parseDownloads(data);
        })
    }

    parseDownloads = (data) => {
        let downloads = [];
        data.forEach((item, index) => {
            if (item.bittorrent.info) {
                downloads.push({ 
                    name: item.bittorrent.info.name,
                    totalLength: item.totalLength,
                    completedLength: item.completedLength,
                    gid: item.gid,
                    path: item.dir
                })
            }
        })
        this.setState({ downloads: downloads })
    }

    componentDidMount = () => {
        this.getDownloads();
        this.interval = setInterval(() => {
            this.getDownloads();
        }, 1000)
    }
    componentWillUnmount = () => {
        clearInterval(this.interval);
    }

    render() {
        return (
            <>
                <h1 className='pageTitle'>Downloads</h1>
                <div className='downloadContainer'>
                    {this.state.downloads.map((file, index) => {
                        const percentage = ((file.completedLength / file.totalLength) * 100).toFixed(2);
                        return (
                            <div 
                                className='download' 
                                key={index} 
                            >
                                <span className='name'>{file.name}</span>
                                <div className='endActions'>
                                    <span className='percentage'>{percentage + '%'}</span>
                                    <FontAwesomeIcon 
                                        icon={faTimesCircle} 
                                        onClick={(e) => this.cancelDownload(file.gid,
                                                                            file.path,
                                                                            file.name,
                                                                            e
                                                                            )}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </>
        )
    }
}
