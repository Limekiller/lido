import { prisma } from '@/lib/prisma';

import Category from '@/components/ui/Category/Category';
import File from '@/components/ui/File/File';
import styles from './movies.module.scss'

const movies = async () => {
    const categories = await prisma.category.findMany(
        {where: {
            parentId: 0
        }}
    )

    const files = await prisma.file.findMany(
        {where: {
            categoryId: 0
        }}
    )

    return <div className={styles.Movies}>
        <h1 className='title'>Movies</h1>

        <div className={styles.categories}>
            {categories.map(category => {
                return <Category
                    key={category.id}
                    name={category.name}
                    link={`/movies/${category.id}`}
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

export default movies