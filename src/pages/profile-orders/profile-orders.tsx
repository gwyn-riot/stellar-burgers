import { ProfileOrdersUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import {
  selectUserOrders,
  userOrdersConnect,
  userOrdersDisconnect
} from '../../services/slices/user-orders-slice';
import { WS_URL } from '../../utils/ws-url';
import { getCookie } from '../../utils/cookie';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectUserOrders);

  useEffect(() => {
    const accessToken = getCookie('accessToken');
    const token = accessToken?.replace('Bearer ', '') || '';

    dispatch(userOrdersConnect(`${WS_URL}/orders?token=${token}`));

    return () => {
      dispatch(userOrdersDisconnect());
    };
  }, [dispatch]);

  return <ProfileOrdersUI orders={orders} />;
};
