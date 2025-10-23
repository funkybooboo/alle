import { useState } from 'react';
import { NavbarIcon } from './NavbarIcon';
import styles from './Navbar.module.css';
import '../../utils.css';

export const Navbar = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const handleSearchClick = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Escape' && isSearchOpen) {
            setIsSearchOpen(false);
        }
    };

    return (
        <nav className="w-full flex items-center gap-4 px-4 py-2 flex-row justify-between">
            <div className="flex flex-row items-center">
                <NavbarIcon 
                    iconName="Search" 
                    isSearchOpen={isSearchOpen} 
                    handleSearchClick={handleSearchClick} 
                    handleKeyDown={handleKeyDown}
                />
                <h1 className={styles.title}>Alle</h1>
            </div>

            <div className="flex flex-row">
                <NavbarIcon 
                    iconName="keyboard_double_arrow_left" 
                    isSearchOpen={isSearchOpen} 
                    handleSearchClick={handleSearchClick} 
                    handleKeyDown={handleKeyDown}
                />
                <NavbarIcon 
                    iconName="keyboard_arrow_left" 
                    isSearchOpen={isSearchOpen} 
                    handleSearchClick={handleSearchClick} 
                    handleKeyDown={handleKeyDown}
                />
                <NavbarIcon 
                    iconName="keyboard_arrow_right" 
                    isSearchOpen={isSearchOpen} 
                    handleSearchClick={handleSearchClick} 
                    handleKeyDown={handleKeyDown}
                />
                <NavbarIcon 
                    iconName="keyboard_double_arrow_right" 
                    isSearchOpen={isSearchOpen} 
                    handleSearchClick={handleSearchClick} 
                    handleKeyDown={handleKeyDown}
                />
                <NavbarIcon 
                    iconName="calendar_today" 
                    isSearchOpen={isSearchOpen} 
                    handleSearchClick={handleSearchClick} 
                    handleKeyDown={handleKeyDown}
                />
            </div>
        </nav>
    );
}