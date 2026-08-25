import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BUN_NAME = 'Краторная булка N-200i';
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';
const SAUCE_NAME = 'Соус Spicy-X';

const ingredientsHar = path.join(__dirname, 'hars', 'ingredients.har');
const userHar = path.join(__dirname, 'hars', 'user.har');
const orderHar = path.join(__dirname, 'hars', 'order.har');

// Тело успешного ответа на создание заказа берём из того же HAR-файла,
// но перехватываем запрос через page.route — POST с JSON-телом требует
// CORS-preflight (OPTIONS), а routeFromHAR ненадёжно сопоставляет такие
// запросы по телу. page.route ловит оба метода без проблем.
const orderHarLog = JSON.parse(fs.readFileSync(orderHar, 'utf-8')).log;
const orderResponseEntry = orderHarLog.entries.find(
  (entry: any) => entry.request.method === 'POST'
);
const orderResponseBody = orderResponseEntry.response.content.text;

test.describe('Страница конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR(ingredientsHar, {
      url: '**/api/ingredients',
      update: false
    });
    await page.routeFromHAR(userHar, {
      url: '**/api/auth/user',
      update: false
    });

    await page.goto('/');
    await expect(page.getByTestId(/^ingredient-/).first()).toBeVisible();
  });

  test('добавление булки из списка ингредиентов в конструктор', async ({
    page
  }) => {
    await expect(
      page.getByText('Выберите булки').first()
    ).toBeVisible();

    const bunCard = page.getByTestId(
      'ingredient-643d69a5c3f7b9001cfa093c'
    );
    await bunCard.getByText('Добавить').click();

    await expect(page.getByText('Выберите булки')).toHaveCount(0);
    await expect(page.getByText(`${BUN_NAME} (верх)`)).toBeVisible();
    await expect(page.getByText(`${BUN_NAME} (низ)`)).toBeVisible();
  });

  test('добавление начинки из списка ингредиентов в конструктор', async ({
    page
  }) => {
    await expect(page.getByText('Выберите начинку')).toBeVisible();

    const mainCard = page.getByTestId(
      'ingredient-643d69a5c3f7b9001cfa0941'
    );
    await mainCard.getByText('Добавить').click();

    await expect(page.getByText('Выберите начинку')).toHaveCount(0);
    await expect(
      page.locator('.constructor-element__text', { hasText: MAIN_NAME })
    ).toBeVisible();
  });

  test('открытие и закрытие модального окна ингредиента по клику на крестик', async ({
    page
  }) => {
    await page.getByText(BUN_NAME).first().click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();
    await expect(page.getByTestId('ingredient-details-name')).toHaveText(
      BUN_NAME
    );

    await page.getByTestId('modal-close-button').click();
    await expect(modal).toHaveCount(0);
  });

  test('закрытие модального окна ингредиента по клику на оверлей', async ({
    page
  }) => {
    await page.getByText(BUN_NAME).first().click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();

    await page.getByTestId('modal-overlay').click({ position: { x: 5, y: 5 } });
    await expect(modal).toHaveCount(0);
  });

  test('в модальном окне отображаются данные именно того ингредиента, по которому произошёл клик', async ({
    page
  }) => {
    await page.getByText(SAUCE_NAME).first().click();

    await expect(page.getByTestId('ingredient-details-name')).toHaveText(
      SAUCE_NAME
    );

    await page.getByTestId('modal-close-button').click();
    await expect(page.getByTestId('modal')).toHaveCount(0);

    await page.getByText(MAIN_NAME).first().click();

    await expect(page.getByTestId('ingredient-details-name')).toHaveText(
      MAIN_NAME
    );
  });
});

test.describe('Оформление заказа', () => {
  test('создание заказа авторизованным пользователем', async ({
    page,
    context
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('refreshToken', 'test-refresh-token');
    });
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'test-access-token',
        url: 'http://localhost:4000'
      }
    ]);

    await page.routeFromHAR(ingredientsHar, {
      url: '**/api/ingredients',
      update: false
    });
    await page.routeFromHAR(userHar, {
      url: '**/api/auth/user',
      update: false
    });
    await page.route('**/api/orders', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({
          status: 204,
          headers: {
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
            'access-control-allow-headers': 'Content-Type,Authorization'
          }
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        headers: { 'access-control-allow-origin': '*' },
        body: orderResponseBody
      });
    });

    await page.goto('/');
    await expect(page.getByTestId(/^ingredient-/).first()).toBeVisible();
    // Дожидаемся, пока приложение подтвердит авторизацию (запрос getUser),
    // иначе клик по "Оформить заказ" может произойти раньше и перенаправить на /login
    await expect(page.getByText('Test User')).toBeVisible();

    await page
      .getByTestId('ingredient-643d69a5c3f7b9001cfa093c')
      .getByText('Добавить')
      .click();
    await page
      .getByTestId('ingredient-643d69a5c3f7b9001cfa0941')
      .getByText('Добавить')
      .click();

    await page.getByTestId('order-button').click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();
    await expect(page.getByTestId('order-number')).toHaveText('12345');

    await page.getByTestId('modal-close-button').click();
    await expect(modal).toHaveCount(0);

    await expect(page.getByText('Выберите булки').first()).toBeVisible();
    await expect(page.getByText('Выберите начинку')).toBeVisible();
  });
});
