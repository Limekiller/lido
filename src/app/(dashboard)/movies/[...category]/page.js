import { prisma } from '@/lib/prisma';

import Category from '@/components/ui/Category/Category';
import File from '@/components/ui/File/File';
import styles from './category.module.scss'

const category = async ({ params }) => {
    const { category } = await params

    const currCategory = await prisma.category.findUnique({
        where: {
            id: parseInt(category.slice(-1)[0])
        }
    })

    const categories = await prisma.category.findMany({
        where: {
            parentId: parseInt(category.slice(-1)[0])
        }
    })

    const files = await prisma.file.findMany(
        {where: {
            categoryId: parseInt(category.slice(-1)[0])
        }}
    )

    const createPath = () => {
        let path = '/movies/'
        for (let catId of category) {
            path += `${catId}/`
        }
        return path
    }

    return <div className={styles.Category}>
        <h1 className='title'>{currCategory.name}</h1>
        <div className={styles.categories}>
            {categories.map(category => {
                return <Category
                    key={category.id}
                    name={category.name}
                    link={`${createPath()}${category.id}`}
                />
            })}
        </div>

        <div className={styles.files}>
            {files.map(file => {
                return <File 
                    className={styles.file}
                    key={file.id}
                    data={file}
                />
            })}
        </div>
    </div>
}

export default category