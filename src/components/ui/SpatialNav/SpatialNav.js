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
                .search input,
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

        SpatialNavigation.add(
            'add',
            { selector: '#addButton', defaultElement: '#addButton' }
        );
        SpatialNavigation.enable('add');

        SpatialNavigation.add(
            'keyboard',
            { selector: '.keyboard__key', defaultElement: '.keyboard__key' }
        );
        SpatialNavigation.makeFocusable('keyboard');
        SpatialNavigation.disable('keyboard');
        SpatialNavigation.focus(document.querySelector('#movies'));
    }

    return <div></div>
}

export default SpatialNav