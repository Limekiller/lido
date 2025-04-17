import { prisma } from "@/lib/prisma"

import libFunctions from "@/lib/lib"

import File from "@/components/ui/File/File"
import styles from './search.module.scss'
import Link from "next/link"

const search = async ({ searchParams }) => {
    let { query } = await searchParams

    let matchingFiles = await prisma.file.findMany({
        where: {
            AND: [
                {OR: [
                    {name: {contains: query}},
                    {metadata: {contains: query}},
                ]},
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

    let tmdbResults = await fetch(`https://api.themoviedb.org/3/search/multi?query=${query}`, {
        headers: {
            "Authorization": `Bearer ${process.env.TMDB_API_KEY}`
        }
    })
    tmdbResults = await tmdbResults.json()
    tmdbResults = tmdbResults.results.filter(result => 
        result.media_type !== 'person' && 
        result.original_language === 'en' &&
        result.popularity > 1 &&
        result.poster_path
    )

    return <div className={styles.Search}>
        <h1 className="title">Search results</h1><br />
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
        {Object.keys(matchingFiles).length && tmdbResults ? <><br /><h2 className={styles.catName}>Downloadable results</h2></> : ""}
        <div className={styles.externalResults}>
            {tmdbResults.map(result => {
                return <Link key={result.id} href={`/browse/${result.media_type}/${result.id}`}>
                    <File
                        data={{ metadata: JSON.stringify(result) }}
                        link={true}
                    />
                </Link>
            })}
        </div>
    </div>
}

export default search