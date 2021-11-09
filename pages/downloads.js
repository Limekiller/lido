import { Component } from 'react'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getSession } from 'next-auth/client'
import AppContext from '@/components/AppContext.js'
import Search from '@/components/Search/Search.js'

export default class downloads extends Component {
    
    static contextType = AppContext

    constructor(props) {
        super(props);
        this.state = { downloads: [] }
    }

    /**
     * Helper function to fetch all in-progress downloads from the server
     */
    getDownloads = () => {
        fetch('/api/downloadActions', {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            this.parseDownloads(data);
        })
    }

    /**
     * Helper function to cancel an in-progress download
     * 
     * @param {string} gid The aria2 gid of the download
     * @param {string} path The final path the download will be moved to
     * @param {string} name The name of the file
     * @param {event} e 
     */
    cancelDownload = (gid, path, name, e) => {
        e.target.parentElement.parentElement.classList.add('inactive')
        fetch('/api/downloadActions?gid=' + gid + '&path=' + path + '&name=' + name, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            this.context.globalFunctions.createToast('notify', 'Download canceled!')
        })
    }

    /**
     * Helper function to parse the downloads and update the component state
     * 
     * @param {obj} data The data returned from /api/downloadActions
     */
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

    // Get download data every second
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
                <Search />
                <h1 className='pageTitle dlPageTitle'>Downloads</h1>
                <div className='downloadContainer'>
                    {this.state.downloads.length === 0 ? 
                        <div className='emptyIcon'>
                            <img src='/images/icons/empty.svg' />
                            <h3>No downloads in progress</h3>
                        </div>
                    : 
                        this.state.downloads.map((file, index) => {
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
                                            onClick={(e) => this.cancelDownload(
                                                file.gid,
                                                file.path,
                                                file.name,
                                                e
                                            )}
                                        />
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </>
        )
    }
}

export async function getServerSideProps(context) {
    const session = await getSession(context)

    if (typeof window === "undefined" && context.res.writeHead) {
        if (!session) {
            context.res.writeHead(302, { Location: "/api/auth/signin" });
            context.res.end();
        }
    }

    return {
        props: { session }
    }
}
