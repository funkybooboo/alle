/**
 * HomeLayout.tsx
 *
 * Layout component for the home page with an Outlet for nested routes.
 */
import { Outlet } from 'react-router-dom';

export const HomeLayout = () => {
  return <Outlet />;
};
