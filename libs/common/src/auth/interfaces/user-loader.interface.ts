/**
 * Interface for loading users in authentication guards
 * Each service should implement this to provide user loading functionality
 */
export interface IUserLoader {
  /**
   * Find user by ID
   * @param id - User ID
   * @returns User entity or throws NotFoundException
   */
  findById(id: string): Promise<any>;
}

/**
 * Provider token for user loader
 * Services should provide their UserService using this token
 */
export const USER_LOADER = Symbol('USER_LOADER');
