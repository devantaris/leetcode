import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { AdminService } from './services/adminService';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AdminGuard: React.FC = () => {
  const { authUser } = useProgress();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      // If no authUser, immediately deny (render 404)
      if (!authUser) {
        if (isMounted) setIsAdmin(false);
        return;
      }

      const result = await AdminService.checkIsAdmin(authUser);
      if (isMounted) setIsAdmin(result);
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [authUser]);

  // While verifying, render blank to avoid route flash
  if (isAdmin === null) {
    return <div className="min-h-screen bg-background" />;
  }

  // If not admin, render 404 so unauthorized users cannot even verify this route exists
  if (!isAdmin) {
    return <NotFoundPage />;
  }

  return <Outlet />;
};
