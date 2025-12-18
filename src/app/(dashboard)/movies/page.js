import { prisma } from '@/lib/prisma';

import Category from '@/components/ui/Category/Category';
import File from '@/components/ui/File/File';
import styles from './movies.module.scss'
import CategoryDownloads from '@/components/ui/CategoryDownloads/CategoryDownloads';

const movies = async ({
    title = "Movies",
    categoryId = 0,
    list = null
}) => {
    const categories = await prisma.category.findMany({
        where: {
            parentId: categoryId,
        }
    })

    const files = await prisma.file.findMany({
        where: {
            categoryId: categoryId,
            area: "video"
        },
        orderBy: {
            'name': 'asc'
        }
    })

    const downloads = await prisma.download.findMany({
        where: {
            destinationCategory: categoryId,
            NOT: {
                state: "complete"
            }
        },
        orderBy: {
            name: "asc"
        }
    })

    return <div className={styles.Movies}>
        <h1 className='title'>{title}</h1>

        {categories.length === 0 && files.length === 0 && downloads.length === 0 ?
            <div className={styles.emptyAlert}>
                <span className="material-icons">all_out</span>
                <span>Nothing here!<br />Why not add some movies?</span>
            </div> :
            <>
                {downloads.length > 0 ? <CategoryDownloads downloads={downloads} /> : ""}

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