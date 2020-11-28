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

class FolderView extends Component {

    constructor(props) {
        super(props);
        this.state = { 
            contents: {
                folders: [],
                files: []
            } 
        };
    }

    componentDidUpdate() {
        this.fetchContents();
    }
    componentDidMount() {
        if (!this.props.session) {
            window.location.href = '/login'
        }
        this.fetchContents();
    }

    fetchContents() {
        fetch('/api/getContents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: decodeURIComponent(window.location.pathname),
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
    }

    deleteFolder(folderName) {
        fetch('/api/folderActions', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: decodeURIComponent(window.location.pathname),
                name: folderName
            })
        })
        .then(response => response.text())
        .then(data => {
            this.fetchContents();
            this.props.globalFunctions.createToast('Folder deleted!')
        })
    }

    checkDropZone = (e) => {
        if (document.querySelector('.dragging')) {
            if (e.target.classList.contains('folder')) {
                const fileName = document.querySelector('.react-draggable-dragging').innerText
                const pathName = decodeURIComponent(window.location.pathname) + '/' + e.target.innerText
                this.moveFile(fileName, pathName)
            } else if (e.target.classList.contains('breadcrumb')) {
                const fileName = document.querySelector('.react-draggable-dragging').innerText
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
                currPath: decodeURIComponent(window.location.pathname),
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
            destPath += breadcrumbs.querySelector('#crumb'+i).innerText + '/'
        }
        return destPath
    }

    generateHTML(data) {
        return (
            <>
                <div className='folders'>
                    {data.folders.map((folder, index) => {
                        return (
                            <Draggable
                                position={{x: 0, y: 0}}
                                onDrag={(e) => this.dragOperations(e)}
                                onStop={(e) => this.checkDropZone(e)}
                                key={index} 
                            >
                                <div key={index} className='folderContainer'>
                                    <FontAwesomeIcon 
                                        className='trash'
                                        icon={faTrashAlt}
                                        onClick={() => this.deleteFolder(folder)} 
                                    />
                                    <Link href={window.location.pathname + '/' + folder}>
                                        <div className='folder'>
                                            <span>{folder}</span>
                                        </div>
                                    </Link>
                                </div>
                            </Draggable>
                        )
                    })}
                </div>

                <div className='files'>
                    {Object.keys(data.files).map((_key, index) => {
                        let hasPoster = false
                        if (data.files[_key].data.Poster && data.files[_key].data.Poster != "N/A") {
                            hasPoster = true
                        }
                        return (
                            <Draggable
                                position={{x: 0, y: 0}}
                                onDrag={(e) => this.dragOperations(e)}
                                onStop={(e) => this.checkDropZone(e)}
                                key={index} 
                            >
                                <div 
                                    className='file'
                                    onClick={() => this.props.globalFunctions.createMessage(<VideoPlayer path={window.location.pathname + '/' + data.files[_key].name}/>)}
                                    style={{
                                        backgroundImage: hasPoster ? 'url("' + data.files[_key].data.Poster + '")' : 'linear-gradient(#6c6c6c, #464646)',
                                        color: hasPoster ? 'rgba(0,0,0,0)' : 'white'
                                    }}
                                >
                                    <span>{decodeURIComponent(data.files[_key].name)}</span>
                                </div>
                            </Draggable>
                        )
                    })}
                </div>

            </>
        )
    }

    render() {

        return (
            <>
                <Breadcrumbs />
                <h1 className='pageTitle'>{this.props.router.asPath.split('/').slice(-1)}</h1>
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

