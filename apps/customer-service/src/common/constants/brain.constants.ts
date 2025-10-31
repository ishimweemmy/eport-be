import { ONE_MINUTE } from '@app/common/constants/all.constants';

export const USER_BY_ID_CACHE = {
  name: 'USER_BY_ID_CACHE',
  ttl: 30 * ONE_MINUTE,
};

export const RESET_PASSWORD_CACHE = {
  name: 'RESET_PASSWORD_CACHE',
  ttl: 15 * ONE_MINUTE, // 15 minutes in milliseconds
};

export const FAILED_LOGIN_ATTEMPT = {
  name: 'FAILED_LOGIN_ATTEMPT',
  ttl: 5 * ONE_MINUTE,
};

export const PORTFOLIO_URL = {
  name: 'PORTFOLIO_URL',
  ttl: 60 * 24 * ONE_MINUTE, // 1 day in milliseconds
};

export const REFRESH_TOKEN_CACHE = {
  name: 'REFRESH_TOKEN',
  ttl: 60 * 24 * 30 * ONE_MINUTE, // 30 days in milliseconds
};
