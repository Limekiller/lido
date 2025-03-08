import { prisma } from '@/lib/prisma';

import Category from '@/components/ui/Category/Category';
import File from '@/components/ui/File/File';
import styles from './movies.module.scss'

const movies = async ({
    title = "Movies",
    categoryId = 0,
    list = false
}) => {
    const categories = await prisma.category.findMany(
        {
            where: {
                parentId: categoryId,
            }
        }
    )

    const files = await prisma.file.findMany(
        {
            where: {
                categoryId: categoryId,
                area: "video"
            }
        }
    )

    return <div className={styles.Movies}>
        <h1 className='title'>{title}</h1>

        {categories.length === 0 && files.length === 0 ?
            <div className={styles.emptyAlert}>
                <span className="material-icons">all_out</span>
                <span>Nothing here!<br />Why not add some movies?</span>
            </div> :
            <>
                {categories.length > 0 ?
                    <div className={styles.categories}>
                        {categories.map(category => {
                            return <Category
                                key={category.id}
                                name={category.name}
                                link={`/${title.toLowerCase()}/${category.id}`}
                            />
                        })}
                    </div>
                    : ""
                }

                <div className={styles.files}>
                    {files.map(file => {
                        return <File
                            className={styles.file}
                            key={file.id}
                            data={file}
                            list={list}
                        />
                    })}
                </div>
            </>
        }
    </div>
}

export default movies