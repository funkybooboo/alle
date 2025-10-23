import React from 'react';
import styles from './Navbar.module.css';

interface NavbarIconProps {
    iconName: string;
    isSearchOpen: boolean;
    handleSearchClick: () => void;
    handleKeyDown: (event: React.KeyboardEvent) => void;
}


export const NavbarIcon = ({ iconName, isSearchOpen, handleSearchClick, handleKeyDown }: NavbarIconProps) => {
    return (
        <>
            <button
                type="button"
                aria-label="Search"
                aria-expanded={isSearchOpen}
                aria-controls="search-panel"
                onClick={handleSearchClick}
                onKeyDown={handleKeyDown}
                className={`p-2 rounded-full flex items-center justify-center ${styles.iconButton}`}
            >
                <span className="material-symbols-outlined" aria-hidden="true">
                    {iconName} 
                </span>
            </button>
        </>
    );
}