import movies from "../movies/page";

const tv = () => {
    return movies({title: "TV", categoryId: 1, list: true})
}

export default tv