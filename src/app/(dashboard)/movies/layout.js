import ViewContainer from '@/components/contexts/ViewContainer/ViewContainer'

import AddButton from "@/components/ui/AddMenu/AddButton/AddButton"
import BreadcrumbTrail from "@/components/ui/BreadcrumbTrail/BreadcrumbTrail"

const MoviesLayout = async ({ children }) => {
    return <>
        <ViewContainer>
            <AddButton />
            <BreadcrumbTrail />
            {children}
        </ViewContainer>
    </> 
}

export default MoviesLayout