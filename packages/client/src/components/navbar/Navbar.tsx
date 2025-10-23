import { useState } from 'react';
import { NavbarIcon } from './NavbarIcon';
import styles from './Navbar.module.css';
import '../../utils.css';


const navigationIcons: string[] = [
    'keyboard_double_arrow_left',
    'keyboard_arrow_left',
    'keyboard_arrow_right',
    'keyboard_double_arrow_right',
    'calendar_today'
];

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
        <nav className={`w-full flex items-center gap-4 px-4 py-2 flex-row justify-between ${styles.navbar}`}>
            <div className="flex flex-row items-center">
                <NavbarIcon 
                    iconName="Search" 
                    isSearchOpen={isSearchOpen} 
                    handleSearchClick={handleSearchClick} 
                    handleKeyDown={handleKeyDown}
                />
                <h1 className={`${styles.title}`}>Alle</h1>
            </div>

            <div className="flex flex-row">
                {
                    navigationIcons.map((iconName: string) => (
                        <NavbarIcon 
                            key={iconName}
                            iconName={iconName}
                            isSearchOpen={isSearchOpen}
                            handleSearchClick={handleSearchClick}
                            handleKeyDown={handleKeyDown}
                        />
                    ))
                }
            </div>
        </nav>
    );
}