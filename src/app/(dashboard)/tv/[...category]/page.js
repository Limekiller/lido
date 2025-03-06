import category from "../../movies/[...category]/page"

const tvCategory = ({ params }) => {
    params.topCat = 'tv'
    return category({ params })
}

export default tvCategory