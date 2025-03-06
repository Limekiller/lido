"use client"

import { useSearchParams } from 'next/navigation'

import styles from './Search.module.scss'

const Search = () => {
    const searchParams = useSearchParams()
    const query = searchParams.get('query')

    const onSearch = query => {
        window.location.href = `/search?query=${query}`
    }

    return <div className={styles.Search}>
        <div className={styles.searchContainer}>
            <span className={`${styles.searchIcon} material-icons`}>search</span>
            <input 
                placeholder='Search movies...' 
                type='text' 
                id='#search' 
                name='search'
                defaultValue={query || ''}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        onSearch(e.target.value)
                    }
                }}
            />
        </div>
    </div>
}

export default Search