"use client"

import { useEffect } from "react";

const SpatialNav = () => {

    useEffect(() => {
        initSpatialNav()
    }, [])

    /**
     * Helper function to initialize all the spatial nav stuff
     */
    const initSpatialNav = async () => {
        let keyboard = false;

        while (!document.querySelector('script[src="/js/spatialnav.js"]') || typeof SpatialNavigation == "undefined") { 
            await new Promise(resolve => setTimeout(resolve, 500)); 
        }

        SpatialNavigation.init();
        SpatialNavigation.add(
            'mainNav', {
            selector: `
                .login a,
                .login button,
                .login input,
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
            if (document.activeElement.closest('.pageContainer') && keyboard) {
                const position = document.activeElement.getBoundingClientRect()
                window.scrollTo({ left: position.left, top: position.top + window.scrollY - (window.innerHeight / 1.5), behavior: 'smooth' })
            }
        }, true);

        document.addEventListener('keydown', () => {
            keyboard = true;
        })
        document.addEventListener('mousemove', () => {
            keyboard = false;
        })

    }

    return <div></div>
}

export default SpatialNav