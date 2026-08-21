import { Middleware, MiddlewareAPI } from 'redux';
import type { AppDispatch, RootState } from '../store';

export type TWsActionTypes = {
  connect: string;
  disconnect: string;
  onOpen: string;
  onClose: string;
  onError: string;
  onMessage: string;
};

type TWsAction = {
  type: string;
  payload?: unknown;
};

export const socketMiddleware = (wsActions: TWsActionTypes): Middleware => {
  let socket: WebSocket | null = null;

  return (store: MiddlewareAPI<AppDispatch, RootState>) =>
    (next) =>
    (action: unknown) => {
      const { dispatch } = store;
      const { type, payload } = action as TWsAction;

      if (type === wsActions.connect) {
        socket = new WebSocket(payload as string);

        socket.onopen = () => {
          dispatch({ type: wsActions.onOpen });
        };

        socket.onerror = () => {
          dispatch({ type: wsActions.onError, payload: 'Ошибка соединения' });
        };

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.success === false) {
            dispatch({
              type: wsActions.onError,
              payload: data.message || 'Ошибка соединения'
            });
            return;
          }
          dispatch({ type: wsActions.onMessage, payload: data });
        };

        socket.onclose = () => {
          dispatch({ type: wsActions.onClose });
        };
      }

      if (type === wsActions.disconnect && socket) {
        socket.close();
        socket = null;
      }

      return next(action);
    };
};
