import { FC, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useDispatch, useSelector } from '../../services/store';
import { selectIngredients } from '../../services/slices/ingredients-slice';
import { selectFeedOrders } from '../../services/slices/feed-slice';
import { selectUserOrders } from '../../services/slices/user-orders-slice';
import {
  getOrderByNumber,
  selectOrderByNumber
} from '../../services/slices/order-slice';

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number: string }>();
  const dispatch = useDispatch();

  const feedOrders = useSelector(selectFeedOrders);
  const userOrders = useSelector(selectUserOrders);
  const orderByNumber = useSelector(selectOrderByNumber);
  const ingredients = useSelector(selectIngredients);

  const orderData = useMemo(() => {
    const orderNumber = Number(number);
    return (
      feedOrders.find((order) => order.number === orderNumber) ||
      userOrders.find((order) => order.number === orderNumber) ||
      (orderByNumber?.number === orderNumber ? orderByNumber : null)
    );
  }, [feedOrders, userOrders, orderByNumber, number]);

  useEffect(() => {
    if (!orderData && number) {
      dispatch(getOrderByNumber(Number(number)));
    }
  }, [orderData, number, dispatch]);

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
