import { prisma } from "@/lib/prisma"

import libFunctions from "@/lib/lib"

import File from "@/components/ui/File/File"
import styles from './search.module.scss'

const search = async ({ searchParams }) => {
    let params = await searchParams

    let matchingFiles = await prisma.file.findMany({
        where: {
            AND: [
                {
                    name: {
                        contains: params.query
                    }
                },
                { area: "video" }
            ]
        }
    })

    // Reformat list of files into an object like
    // {
    //  catId1: [
    //      {file}, 
    //      {file}
    //  ], 
    //  catId2: [
    //      {file}, 
    //      {file}
    //  ]
    //}
    matchingFiles = matchingFiles.reduce((acc, item) => {
        if (!acc[item.categoryId]) {
            acc[item.categoryId] = []
        }
        acc[item.categoryId].push(item)
        return acc
    }, {})


    return <div className={styles.Search}>
        {Object.keys(matchingFiles).map(async categoryId => {
            const category = matchingFiles[categoryId]
            const categoryTree = await libFunctions.getCategoryTree(categoryId)

            return <div key={categoryId} className="category">

                <h2>
                    {categoryTree.map((cat, index) => {
                        return <span className={styles.catName} key={cat.id}>
                            {cat.name}
                            {index < categoryTree.length - 1 ? ' / ' : ''}
                        </span>
                    })}
                </h2>

                <div className={styles.files}>
                    {category.map(file => {
                        return <File
                            // className={styles.file}
                            key={file.id}
                            data={file}
                            list={true}
                        />
                    })}
                </div>
            </div>

        })}
    </div>
}

export default search