import { Component } from 'react'

import Link from 'next/link'
import Router from "next/router";
import { getSession } from 'next-auth/client'
import { withRouter } from 'next/router'

import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs.js'
import Add from '@/components/Add/Add.js'
import VideoPlayer from '@/components/MessageContainer/VideoPlayer/VideoPlayer.js'
import AppContext from '@/components/AppContext.js'
import Search from '@/components/Search/Search.js'
import LoadingFilesIndicator from '@/components/LoadingFilesIndicator/LoadingFilesIndicator.js'

import Draggable from 'react-draggable';
import { faTrashAlt, faList } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class FolderView extends Component {

    static contextType = AppContext

    constructor(props) {
        super(props);
        this.state = {
            hasLoaded: false,
            contents: {
                folders: [],
                files: []
            },
            listView: props.router.asPath.slice(0, 3) == '/TV' ? true : false
        };
        this.fetchContents = this.fetchContents.bind(this);
    }

    componentDidMount() {
        if (!this.props.session) {
            window.location.href = '/login'
        }
        this.fetchContents();
        Router.events.on("routeChangeComplete", this.fetchContents);
    }
    componentDidUpdate(prevProps) {
        if (prevProps.router.asPath !== this.props.router.asPath) {
            this.setState({listView: this.props.router.asPath.slice(0, 3) == '/TV' ? true : false})
        }
    }
    componentWillUnmount() {
        Router.events.off("routeChangeComplete", this.fetchContents);
    }

    /**
     * Helper function to populate the page with the folder contents
     */
    fetchContents() {
        this.setState({ hasLoaded: false })
        fetch('/api/getContents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: window.location.pathname,
            })
        })
        .then(response => response.json())
        .then(data => {
            this.setState({ hasLoaded: true })
            if (JSON.stringify(this.state.contents) != JSON.stringify(data)) {
                this.setState({contents: data})
                // Fetch each item separately and cache in localstorage
                this.state.contents.files.forEach(async (file, index) => {
                    const encodedTitle = btoa(file.name)
                    if (localStorage.getItem(encodedTitle) === null) {
                        let data = fetch('/api/getMovieData?title=' + file.name)
                        .then(response => response.json())
                        .then(data => {
                            if (data.Response === "True") {
                                const tempFiles = this.state.contents.files
                                tempFiles[index]['data'] = data
                                this.setState({contents: {...this.state.contents, files: tempFiles}})
                                localStorage.setItem(encodedTitle, JSON.stringify(data))
                            }
                        })
                    } else {
                        const tempFiles = this.state.contents.files
                        tempFiles[index]['data'] = JSON.parse(localStorage.getItem(encodedTitle))
                        this.setState({contents: {...this.state.contents, files: tempFiles}})
                    }
                })
            }
        })
        .catch(error => {
            this.context.globalFunctions.createToast('alert', 'Location does not exist!')
            Router.push('/')
        })
    }

    /**
     * Helper function to delete folders or files
     * 
     * @param {string} folderName The path to the folder
     */
    deleteItem(folderName) {
        fetch('/api/folder', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: window.location.pathname,
                name: folderName
            })
        })
        .then(response => response.text())
        .then(data => {
            this.fetchContents();
            this.context.globalFunctions.createToast('notify', 'Folder deleted!')
        })
    }

    /**
     * When a file or folder is dropped, this function checks what it was dropped on
     * and fires the appropriate action
     * 
     * @param {event} e 
     */
    checkDropZone = (e) => {
        e.preventDefault()
        if (document.querySelector('.dragging')) {
            //const fileName = encodeURIComponent(document.querySelector('.react-draggable-dragging').innerText)
            const fileName = encodeURIComponent(document.querySelector('.react-draggable-dragging').dataset.filename)
            if (e.target.classList.contains('folder')) {
                const pathName = window.location.pathname + '/' + encodeURIComponent(e.target.innerText)
                this.moveItem(fileName, pathName)
            } else if (e.target.classList.contains('breadcrumb')) {
                const pathName = this.getBreadcrumbPath(e.target.id)
                this.moveItem(fileName, pathName)
            }
        }
    }
    dragOperations = (e) => {
        e.preventDefault();
        document.querySelector('.react-draggable-dragging').classList.add('dragging')
        if (e.target.classList.contains('folder') || e.target.classList.contains('breadcrumb')) {
            document.querySelector('.react-draggable-dragging').classList.add('droppable')
        } else {
            document.querySelector('.react-draggable-dragging').classList.remove('droppable')
        }
    }

    /**
     * Helper function to move files or folders to a new location
     * Rename is the same operation
     * 
     * @param {string} fileName The name of the file or folder we want to move
     * @param {string} destPath The path to the new location
     */
    moveItem = (fileName, destPath) => {
        fetch('/api/folder', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currPath: window.location.pathname,
                destPath: destPath,
                fileName: fileName,
                type: 'folder'
            })
        })
        .then(response => response.text())
        .then(data => {
            this.fetchContents()
        })
    }

    /**
     * Given the id of an element in the breadcrumb path, get the full path to the location of that breadcrumb
     * Called when an item is dropped on a breadcrumb
     * 
     * @param {string} id The DOM id of the breadcrumb
     * @returns {string} The path to this breadcrumb
     */
    getBreadcrumbPath = (id) => {
        const index = id.slice(-1)
        let destPath = ''
        const breadcrumbs = document.querySelector('#breadcrumbs')
        for (let i=0; i<=index; i++) {
            destPath += encodeURIComponent(breadcrumbs.querySelector('#crumb'+i).innerText) + '/'
        }
        return destPath
    }

    toggleList = () => {
        this.setState({listView: !this.state.listView})
    }

    /**
     * Helper function to get all the html for the folder and file views
     * 
     * @param {obj} data The data from this.state.contents
     * @returns {JSX}
     */
    generateHTML(data) {
        // if () {
        //     this.setState({listView: true})
        // }

        return (
            <>
                {data.folders.length === 0 && data.files.length === 0 ?
                    <div className='emptyIcon'>
                        <img src='/images/icons/empty.svg' />
                        <h3>There's nothing here! Why not add some files?</h3>
                    </div>
                : ''}
                
                <div className='folders'>
                    {data.folders.map((folder, index) => {
                        const innerHTML = <div 
                            tabIndex="0" 
                            key={index} 
                            className='folderContainer'
                            onKeyDown={e => {if (e.key === 'Enter') { e.target.querySelector('.folder').click() }}}
                            data-filename={decodeURIComponent(folder)}
                        >
                            <Link href={window.location.pathname + '/' + folder}>
                                <div className='folder'>
                                    <span>{decodeURIComponent(folder)}</span>
                                </div>
                            </Link>
                            <FontAwesomeIcon
                                className='trash'
                                icon={faTrashAlt}
                                onClick={() => this.deleteItem(folder)}
                            />
                        </div>
                        if (window.innerWidth > 1000) {
                            return (
                                <Draggable
                                    position={{x: 0, y: 0}}
                                    onDrag={(e) => this.dragOperations(e)}
                                    onStop={(e) => this.checkDropZone(e)}
                                    key={index}
                                >
                                    {innerHTML}
                                </Draggable>
                            )
                        }
                        return innerHTML
                    })}
                </div>

                <div 
                    className={`
                        files
                        ${this.state.listView ? 'listView' : ''}
                    `}
                >
                    {Object.keys(data.files).map((_key, index) => {
                        let hasPoster = false
                        if (data.files[_key].data.Poster && data.files[_key].data.Poster != "N/A") {
                            hasPoster = true
                        }
                        let seriesTitle = ''
                        if (data.files[_key].data.Type === 'episode') {
                            let title = data.files[_key].name.split(/s[0-9]{2}e[0-9]{2}/i)[0].slice(0, -1)
                            let episodeInfo = data.files[_key].name.split(title)[1].slice(1, 7)
                            seriesTitle = `${title} • ${episodeInfo}`
                        }
                        const innerHTML = <div
                                className='file'
                                onClick={(e) => this.context.globalFunctions.createMessage(<VideoPlayer path={window.location.pathname + '/' + data.files[_key].name}/>)}
                                onKeyDown={e => {if (e.key === 'Enter') { e.target.click() }}}
                                style={{color: hasPoster && data.files[_key].data.Type === 'movie' ? 'rgba(0,0,0,0)' : 'white'}}
                                tabIndex='0'
                                data-filename={decodeURIComponent(data.files[_key].name)}
                            >
                            <div 
                                className='filePoster' 
                                style={{
                                    backgroundImage: hasPoster ? 'url("' + data.files[_key].data.Poster + '")' : 'linear-gradient(#6c6c6c, #464646)',
                                    opacity: hasPoster && !seriesTitle && !this.state.listView ? '1' : '0',
                                    transform: hasPoster ? 'scale(1)' : 'scale(0.98)'
                                }}
                            />
                            <span className='title'>{
                                data.files[_key].data.Title ??
                                decodeURIComponent(data.files[_key].name)
                            }</span>
                            <span className='seriesTitle'>{seriesTitle}</span>
                        </div>
                        if (window.innerWidth > 1000) {
                            return (
                                <Draggable
                                    position={{x: 0, y: 0}}
                                    onDrag={(e) => this.dragOperations(e)}
                                    onStop={(e) => this.checkDropZone(e)}
                                    key={index}
                                >
                                    {innerHTML}
                                </Draggable>
                            )
                        }
                        return innerHTML
                    })}
                </div>

            </>
        )
    }

    render() {

        return (
            <>
                <Search />
                <Breadcrumbs />
                <h1 className='pageTitle'>{decodeURIComponent(this.props.router.asPath.split('/').slice(-1))}</h1>
                <div className='viewOptions'>
                    <FontAwesomeIcon
                        className='listToggle'
                        icon={faList}
                        onClick={() => this.toggleList()}
                    />
                </div>
                {this.state.hasLoaded ? this.generateHTML(this.state.contents) : <LoadingFilesIndicator />}
                <Add fetchContents={this.fetchContents.bind(this)}/>
            </>
        )
    }
}

export async function getServerSideProps(context) {
    const session = await getSession(context)

    if (typeof window === "undefined" && context.res.writeHead) {
        if (!session) {
            context.res.writeHead(302, { Location: "/login" });
            context.res.end();
        }
    }

    return {
        props: { session }
    }
}

export default withRouter(FolderView)

