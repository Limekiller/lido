import styles from './Add.module.scss'
import Message from '@/components/MessageContainer/Message/Message'
import { Component, useState } from 'react'
import Menu from './Menu/Menu.js'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import AppContext from '@/components/AppContext.js'

class Add extends Component {

    static contextType = AppContext

    constructor(props) {
        super(props);
        this.state = { menuOpen: false }
        this.toggleMenu = this.toggleMenu.bind(this);
    }

    toggleMenu() {
        if (!this.state.menuOpen) {
            const message = 
            <Message>
                <Menu 
                    menuOpen={this.state.menuOpen}
                    functions={this.childFunctions}
                />
            </Message>
            this.context.globalFunctions.createMessage(message)
        } else {
            this.context.globalFunctions.closeAllMessages()
        }
        this.setState({menuOpen: !this.state.menuOpen})
    }

    childFunctions = {
        fetchContents: this.props.fetchContents,
        toggleMenu: () => this.toggleMenu()
    }

    render() {
        return (
            <>
                <div 
                    className={`
                        ${styles.add}
                        ${this.state.menuOpen ? styles.active : ''}
                    `} 
                    id='addButton' 
                    onClick={() => this.toggleMenu()}
                    onKeyDown={(e) => { if (e.code === 'Enter') { e.target.click() } }}
                >
                    <FontAwesomeIcon 
                        className={`
                            ${this.state.menuOpen ? styles.active : ''}
                        `}
                        icon={faPlus} 
                    />
                </div>
            </>
        )
    }
}



export default Add
