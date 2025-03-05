import AddButton from "@/components/addMenu/AddButton/AddButton"
import BreadcrumbTrail from "@/components/ui/BreadcrumbTrail/BreadcrumbTrail"

const MoviesLayout = async ({ children }) => {
    return <>
        <AddButton />
        <BreadcrumbTrail />
        {children}
    </> 
}

export default MoviesLayout