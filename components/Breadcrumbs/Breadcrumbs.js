import styles from './Breadcrumbs.module.scss'
import { useRouter } from 'next/router'
import Link from 'next/link'

const buildLink = (index, pathArray) => {
    let link = '/'
    for (let i=0; i<=index; i++) {
        link += pathArray[i] + '/'
    }
    return link
}

const Breadcrumbs = () => {
    const router = useRouter()
    const pathArray = router.asPath.split('/').slice(1)

    return (
        <div id='breadcrumbs' className={styles.breadcrumbs}>
            {pathArray.map((path, index) => {
                return (
                    <Link 
                        href={buildLink(index, pathArray)} 
                        key={index}
                        className={`
                            ${styles.breadcrumb}
                            breadcrumb
                        `}
                        id={'crumb' + index}>
                        {decodeURIComponent(path)}
                    </Link>
                )
            })}
        </div>
    )
}

export default Breadcrumbs
