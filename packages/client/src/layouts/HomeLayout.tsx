/**
 * HomeLayout.tsx
 * 
 * Layout component for the home page, including the Navbar and an Outlet for nested routes.
 */
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/navbar/Navbar';


export const HomeLayout = () => {


    return (
        <>
            <Navbar />
            <Outlet />
        </>
    );

}