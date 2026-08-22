import { FC, ReactElement } from 'react';
import { Location, Navigate, To, useLocation } from 'react-router-dom';

import { Preloader } from '@ui';
import { useSelector } from '../../services/store';
import {
  selectIsAuthChecked,
  selectIsAuthenticated
} from '../../services/slices/user-slice';

type TProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: ReactElement;
};

export const ProtectedRoute: FC<TProtectedRouteProps> = ({
  onlyUnAuth = false,
  children
}) => {
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (onlyUnAuth && isAuthenticated) {
    const state = location.state as { from?: Location } | null;
    const from: To = state?.from || '/';
    return <Navigate replace to={from} />;
  }

  if (!onlyUnAuth && !isAuthenticated) {
    return <Navigate replace to='/login' state={{ from: location }} />;
  }

  return children;
};
