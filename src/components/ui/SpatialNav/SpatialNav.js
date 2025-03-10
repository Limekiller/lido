"use client"

import { useEffect } from "react";

const SpatialNav = () => {

    useEffect(() => {
        initSpatialNav()
    }, [])

    /**
     * Helper function to initialize all the spatial nav stuff
     */
    const initSpatialNav = () => {
        SpatialNavigation.init();
        SpatialNavigation.add(
            'mainNav', {
            selector: `
                .sidebar a, 
                .sidebar button,
                #search,
                .pageContainer a, 
                .pageContainer input, 
                .pageContainer button, 
                .folderContainer, 
                .file
          `,
            defaultElement: '#movies'
        }
        );
        SpatialNavigation.makeFocusable('mainNav');

        SpatialNavigation.focus(document.querySelector('#movies'));

        document.addEventListener('focus', () => {
            if (document.activeElement.id === 'search') {
                window.scrollTo({top: 0, behavior: 'smooth'})
                return
            }
            if (document.activeElement.closest('.pageContainer')) {
                const position = document.activeElement.getBoundingClientRect()
                window.scrollTo({ left: position.left, top: position.top + window.scrollY - (window.innerHeight / 2), behavior: 'smooth' })
            }
        }, true);
    }

    return <div></div>
}

export default SpatialNav