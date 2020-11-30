import Link from 'next/link'
import path from 'path'
import { Component } from 'react'
import Add from '@/components/Add/Add.js'
import VideoPlayer from '@/components/MessageContainer/VideoPlayer/VideoPlayer.js'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs.js'
import { withRouter } from 'next/router'
import Draggable from 'react-draggable';
import { getSession } from 'next-auth/client'
import Router from "next/router";



class FolderView extends Component {

    constructor(props) {
        super(props);
        this.state = { 
            contents: {
                folders: [],
                files: []
            } 
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
    componentWillUnmount() {
        Router.events.off("routeChangeComplete", this.fetchContents);
    }

    fetchContents() {
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
            if (JSON.stringify(this.state.contents) != JSON.stringify(data)) {
                this.setState({
                    contents: data
                });
            }
        })
        .catch(error => {
            this.props.globalFunctions.createToast('alert', 'Location does not exist!')
            Router.push('/')
        })
    }

    deleteFolder(folderName) {
        fetch('/api/folderActions', {
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
            this.props.globalFunctions.createToast('notify', 'Folder deleted!')
        })
    }

    checkDropZone = (e) => {
        if (document.querySelector('.dragging')) {
            if (e.target.classList.contains('folder')) {
                const fileName = encodeURIComponent(document.querySelector('.react-draggable-dragging').innerText)
                const pathName = window.location.pathname + '/' + encodeURIComponent(e.target.innerText)
                this.moveFile(fileName, pathName)
            } else if (e.target.classList.contains('breadcrumb')) {
                const fileName = encodeURIComponent(document.querySelector('.react-draggable-dragging').innerText)
                const pathName = this.getBreadcrumbPath(e.target.id)
                this.moveFile(fileName, pathName)
            }
        }
    }
    dragOperations = (e) => {
        document.querySelector('.react-draggable-dragging').classList.add('dragging')
        if (e.target.classList.contains('folder') || e.target.classList.contains('breadcrumb')) {
            document.querySelector('.react-draggable-dragging').classList.add('droppable')
        } else {
            document.querySelector('.react-draggable-dragging').classList.remove('droppable')
        }
    }
    moveFile = (fileName, destPath) => {
        fetch('/api/folderActions', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currPath: window.location.pathname,
                destPath: destPath,
                fileName: fileName
            })
        })
        .then(response => response.text())
        .then(data => {
            this.fetchContents()
        })
    }
    getBreadcrumbPath = (id) => {
        const index = id.slice(-1)
        let destPath = ''
        const breadcrumbs = document.querySelector('#breadcrumbs')
        for (let i=0; i<=index; i++) {
            destPath += encodeURIComponent(breadcrumbs.querySelector('#crumb'+i).innerText) + '/'
        }
        return destPath
    }

    generateHTML(data) {
        return (
            <>
                <div className='folders'>
                    {data.folders.map((folder, index) => {
                        const innerHTML = <div key={index} className='folderContainer'>
                                            <FontAwesomeIcon 
                                                className='trash'
                                                icon={faTrashAlt}
                                                onClick={() => this.deleteFolder(folder)} 
                                            />
                                            <Link href={window.location.pathname + '/' + folder}>
                                                <div className='folder'>
                                                    <span>{decodeURIComponent(folder)}</span>
                                                </div>
                                            </Link>
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

                <div className='files'>
                    {Object.keys(data.files).map((_key, index) => {
                        let hasPoster = false
                        if (data.files[_key].data.Poster && data.files[_key].data.Poster != "N/A") {
                            hasPoster = true
                        }
                        const innerHTML = <div 
                                            className='file'
                                            onClick={() => this.props.globalFunctions.createMessage(<VideoPlayer path={window.location.pathname + '/' + data.files[_key].name}/>)}
                                            style={{
                                                backgroundImage: hasPoster ? 'url("' + data.files[_key].data.Poster + '")' : 'linear-gradient(#6c6c6c, #464646)',
                                                color: hasPoster ? 'rgba(0,0,0,0)' : 'white'
                                            }}
                                        >
                                            <span>{decodeURIComponent(data.files[_key].name)}</span>
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
                <Breadcrumbs />
                <h1 className='pageTitle'>{decodeURIComponent(this.props.router.asPath.split('/').slice(-1))}</h1>
                {this.generateHTML(this.state.contents)}
                <Add 
                    fetchContents={this.fetchContents.bind(this)}
                    globalFunctions={this.props.globalFunctions}
                />
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

