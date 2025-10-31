import {
  LOGGED_IN_USER_KEY,
  ROLE_GUARD_KEY,
} from '@customer-service/common/constants/all.constants';
import { SetMetadata } from '@nestjs/common';

export const PreAuthorize = (...roles: string[]) =>
  SetMetadata(ROLE_GUARD_KEY, roles);

export const AuthUser = () => SetMetadata(LOGGED_IN_USER_KEY, true);
