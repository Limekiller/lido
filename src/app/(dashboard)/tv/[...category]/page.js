import category from "../../movies/[...category]/page"

const tvCategory = ({ params }) => {
    params.topCat = 'tv'
    const list = true
    
    return category({ params, list })
}

export default tvCategory