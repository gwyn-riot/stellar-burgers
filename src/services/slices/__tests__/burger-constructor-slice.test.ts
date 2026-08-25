import burgerConstructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredientUp,
  moveIngredientDown,
  clearConstructor
} from '../burger-constructor-slice';
import { TIngredient } from '@utils-types';

const initialState = {
  bun: null,
  ingredients: []
};

const mockBun: TIngredient = {
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
};

const mockMain: TIngredient = {
  _id: '643d69a5c3f7b9001cfa0941',
  name: 'Биокотлета из марсианской Магнолии',
  type: 'main',
  proteins: 420,
  fat: 142,
  carbohydrates: 242,
  calories: 4242,
  price: 424,
  image: 'https://code.s3.yandex.net/react/code/meat-01.png',
  image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png'
};

const mockSauce: TIngredient = {
  _id: '643d69a5c3f7b9001cfa0942',
  name: 'Соус Spicy-X',
  type: 'sauce',
  proteins: 30,
  fat: 20,
  carbohydrates: 40,
  calories: 30,
  price: 90,
  image: 'https://code.s3.yandex.net/react/code/sauce-02.png',
  image_large: 'https://code.s3.yandex.net/react/code/sauce-02-large.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/sauce-02-mobile.png'
};

describe('редьюсер слайса burgerConstructor', () => {
  it('должен возвращать начальное состояние при вызове с неизвестным экшеном', () => {
    const result = burgerConstructorReducer(undefined, { type: 'UNKNOWN' });
    expect(result).toEqual(initialState);
  });

  it('должен добавлять булку в bun при экшене addIngredient с булкой', () => {
    const result = burgerConstructorReducer(
      initialState,
      addIngredient(mockBun)
    );
    expect(result.bun).toMatchObject(mockBun);
    expect(result.bun).toHaveProperty('id');
    expect(result.ingredients).toHaveLength(0);
  });

  it('должен заменять булку, а не добавлять вторую, при повторном addIngredient с булкой', () => {
    const stateWithBun = burgerConstructorReducer(
      initialState,
      addIngredient(mockBun)
    );
    const anotherBun: TIngredient = { ...mockBun, _id: 'another-bun-id' };
    const result = burgerConstructorReducer(
      stateWithBun,
      addIngredient(anotherBun)
    );
    expect(result.bun?._id).toBe('another-bun-id');
  });

  it('должен добавлять начинку в конец ingredients при экшене addIngredient с начинкой', () => {
    const result = burgerConstructorReducer(
      initialState,
      addIngredient(mockMain)
    );
    expect(result.ingredients).toHaveLength(1);
    expect(result.ingredients[0]).toMatchObject(mockMain);
    expect(result.ingredients[0]).toHaveProperty('id');
  });

  it('должен удалять ингредиент по id при экшене removeIngredient', () => {
    const stateWithIngredient = burgerConstructorReducer(
      initialState,
      addIngredient(mockMain)
    );
    const addedId = stateWithIngredient.ingredients[0].id;

    const result = burgerConstructorReducer(
      stateWithIngredient,
      removeIngredient(addedId)
    );
    expect(result.ingredients).toHaveLength(0);
  });

  it('должен менять местами ингредиенты при экшене moveIngredientUp', () => {
    let state = burgerConstructorReducer(initialState, addIngredient(mockMain));
    state = burgerConstructorReducer(state, addIngredient(mockSauce));

    const [firstId, secondId] = state.ingredients.map((item) => item.id);

    const result = burgerConstructorReducer(state, moveIngredientUp(1));

    expect(result.ingredients[0].id).toBe(secondId);
    expect(result.ingredients[1].id).toBe(firstId);
  });

  it('должен менять местами ингредиенты при экшене moveIngredientDown', () => {
    let state = burgerConstructorReducer(initialState, addIngredient(mockMain));
    state = burgerConstructorReducer(state, addIngredient(mockSauce));

    const [firstId, secondId] = state.ingredients.map((item) => item.id);

    const result = burgerConstructorReducer(state, moveIngredientDown(0));

    expect(result.ingredients[0].id).toBe(secondId);
    expect(result.ingredients[1].id).toBe(firstId);
  });

  it('не должен ничего менять при moveIngredientUp для первого элемента', () => {
    const state = burgerConstructorReducer(
      initialState,
      addIngredient(mockMain)
    );
    const result = burgerConstructorReducer(state, moveIngredientUp(0));
    expect(result).toEqual(state);
  });

  it('не должен ничего менять при moveIngredientDown для последнего элемента', () => {
    const state = burgerConstructorReducer(
      initialState,
      addIngredient(mockMain)
    );
    const result = burgerConstructorReducer(state, moveIngredientDown(0));
    expect(result).toEqual(state);
  });

  it('должен очищать конструктор при экшене clearConstructor', () => {
    let state = burgerConstructorReducer(initialState, addIngredient(mockBun));
    state = burgerConstructorReducer(state, addIngredient(mockMain));

    const result = burgerConstructorReducer(state, clearConstructor());

    expect(result).toEqual(initialState);
  });
});
