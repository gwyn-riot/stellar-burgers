const apiUrl = process.env.BURGER_API_URL || '';

export const WS_URL = apiUrl.replace(/^http/, 'ws').replace(/\/api\/?$/, '');
