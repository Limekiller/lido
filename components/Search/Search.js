import { useState } from 'react'
import { useRouter } from 'next/router'

import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import styles from './Search.module.scss'

const Search = (props) => {

    const router = useRouter()
    const [searchType, setsearchType] = useState(true) // true = local | false = stream

    const onKeyDown = (e) => {
        setTimeout(() => {
            if (e.keyCode == 13 && (document.querySelector('.keyboard').classList.contains('keyboard--hidden'))) {
                if (searchType) {
                    router.push('/search?query=' + document.querySelector('#searchBar').value)
                } else {
                    router.push('/?query=' + document.querySelector('#searchBar').value)
                }
            }
        }, 10)
    }

    return (
        <div className={`
            ${styles.search}
            ${props._style && props._style == 'fancy' ? styles.fancy : ''}
        `}>
            <div className={styles.searchBar} >
                <input id='searchBar' type='text' onKeyDown={(e) => onKeyDown(e)} className='search use-keyboard-input' />
                <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            </div>
            <button name='searchType' className='unstyled' onClick={() => {setsearchType(!searchType)}}>
                <div className={styles.searchToggle}>
                    <div 
                        className={`
                            ${styles.toggleIndicator}
                            ${searchType ? '' : styles.right}
                        `}
                    />
                </div>
            </button>
            <label htmlFor='searchType' className={styles.searchLabel}>Search {searchType ? 'locally' : 'streams'}</label>
        </div>
    )
}

export default Search
