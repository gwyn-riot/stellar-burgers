import ingredientsReducer, { getIngredients } from '../ingredients-slice';
import { TIngredient } from '@utils-types';

const initialState = {
  ingredients: [],
  isLoading: false,
  error: null
};

const mockIngredients: TIngredient[] = [
  {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://code.s3.yandex.net/react/code/bun-02.png',
    image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png'
  }
];

describe('редьюсер слайса ingredients', () => {
  it('должен возвращать начальное состояние при вызове с неизвестным экшеном', () => {
    const result = ingredientsReducer(undefined, { type: 'UNKNOWN' });
    expect(result).toEqual(initialState);
  });

  it('должен выставлять isLoading в true при getIngredients.pending', () => {
    const action = { type: getIngredients.pending.type };
    const result = ingredientsReducer(initialState, action);
    expect(result).toEqual({
      ingredients: [],
      isLoading: true,
      error: null
    });
  });

  it('должен сохранять полученные ингредиенты при getIngredients.fulfilled', () => {
    const action = {
      type: getIngredients.fulfilled.type,
      payload: mockIngredients
    };
    const result = ingredientsReducer(
      { ingredients: [], isLoading: true, error: null },
      action
    );
    expect(result).toEqual({
      ingredients: mockIngredients,
      isLoading: false,
      error: null
    });
  });

  it('должен сохранять текст ошибки при getIngredients.rejected', () => {
    const action = {
      type: getIngredients.rejected.type,
      error: { message: 'Не удалось загрузить ингредиенты' }
    };
    const result = ingredientsReducer(
      { ingredients: [], isLoading: true, error: null },
      action
    );
    expect(result).toEqual({
      ingredients: [],
      isLoading: false,
      error: 'Не удалось загрузить ингредиенты'
    });
  });
});
