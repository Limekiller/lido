"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './BreadcrumbTrail.module.scss'

const BreadcrumbTrail = () => {
    const pathname = usePathname() 
    const [categoryNames, setCategoryNames] = useState({})

    const fetchCategoryNames = async pathname => {
        const catIds = pathname.slice(1).split('/').join(',')
        let response = await fetch(`/api/category?id=${catIds}`)
        response = await response.json()

        let newCatNames = {
            'movies': 'Movies',
            'tv': 'TV'
        }
        for (let cat in response.data) {
            newCatNames[response.data[cat].id] = response.data[cat].name
        }
        setCategoryNames(newCatNames)
    }

    useEffect(() => {
        fetchCategoryNames(pathname)
    }, [pathname]);

    return <div className={styles.BreadcrumbTrail}>
        {pathname.slice(1).split("/").map((pathElem, index) => {
            let link = ''
            for (let i = 0; i < index + 1; i++) {
                link += `/${pathname.slice(1).split('/')[i]}`
            }
            return <div className={styles.link} key={pathElem}>
                <Link href={link} key={pathElem}>
                    <span>{categoryNames[pathElem] || ''}</span>
                </Link>
                {index < pathname.slice(1).split("/").length - 1 ? ">" : ''}
            </div>
        })}
    </div>
}

export default BreadcrumbTrail