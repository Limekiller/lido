import styles from './Search.module.scss'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'

const Search = (props) => {

    const router = useRouter()
    const onKeyDown = (e) => {
        if (e.keyCode == 13) {
            router.push('/search?query=' + document.querySelector('#searchBar').value)
        }
    }

    return (
        <div className={`
            ${styles.search}
            ${props._style && props._style == 'fancy' ? styles.fancy : ''}
        `}>
            <div className={styles.searchBar} >
                <input id='searchBar' type='text' onKeyDown={(e) => onKeyDown(e)} className='search' />
                <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            </div>
        </div>
    )
}

export default Search
