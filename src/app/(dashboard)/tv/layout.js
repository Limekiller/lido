import AddButton from "@/components/ui/AddMenu/AddButton/AddButton"
import BreadcrumbTrail from "@/components/ui/BreadcrumbTrail/BreadcrumbTrail"

const MoviesLayout = async ({ children }) => {
    return <>
        <AddButton />
        <BreadcrumbTrail />
        {children}
    </> 
}

export default MoviesLayout