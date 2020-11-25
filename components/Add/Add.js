import styles from './Add.module.scss'
import { Component, createRef } from 'react'
import Menu from './Menu/Menu.js'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class Add extends Component {

    constructor(props) {
        super(props);
        this.state = { menuOpen: false, activeOption: null }
        this.toggleVisibility = this.toggleVisibility.bind(this);
    }

    toggleVisibility() {
        this.setState({ menuOpen: !this.state.menuOpen })
        this.setState({ activeOption: null })
    }

    setActiveOption(option) {
        this.setState({ activeOption: option })
    }

    childFunctions = {
        toggleVisibility: this.toggleVisibility.bind(this),
        fetchContents: this.props.fetchContents,
        setActiveOption: this.setActiveOption.bind(this)
    }

    render() {
        return (
            <>
                <Menu 
                    menuOpen={this.state.menuOpen}
                    functions={this.childFunctions}
                    activeOption={this.state.activeOption}
                />
                <div className={styles.add} id='addButton' onClick={() => this.toggleVisibility()}>
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
