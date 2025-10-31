import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _503, _404, _401 } from '@app/common/constants/errors-constants';
import { Status } from '@grpc/grpc-js/build/src/constants';

@Injectable()
export class GrpcErrorHandler {
  constructor(private readonly exceptionHandler: ExceptionHandler) {}

  /**
   * Handles GRPC errors and maps them to appropriate HTTP exceptions
   * @param error - The GRPC error
   * @param context - Additional context for error handling
   */
  handleGrpcError(error: any, context?: string): never {
    console.error(`GRPC Error in ${context || 'unknown context'}:`, error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error.constructor.name);
    console.error('Is RpcException:', error instanceof RpcException);
    console.error('Error message:', error.message);

    if (error instanceof RpcException) {
      const grpcError = error.getError() as any;
      let code: number | undefined;
      let message: string = '';

      if (grpcError && typeof grpcError === 'object') {
        code = grpcError.code;
        message = grpcError.message || grpcError.details || '';
      } else if (typeof grpcError === 'string') {
        message = grpcError;
      }

      switch (code) {
        case Status.NOT_FOUND:
          if (message.includes('department')) {
            this.exceptionHandler.throwNotFound({
              code: 'DEPARTMENT_NOT_LINKED',
              message:
                'You are not linked to any department in MIS. Please contact the MIS administrator to assign a department to you.',
            });
          } else if (message.includes('college')) {
            this.exceptionHandler.throwNotFound({
              code: 'COLLEGE_NOT_LINKED',
              message:
                'You are not linked to any college in MIS. Please contact the MIS administrator to assign a college to you.',
            });
          } else if (
            message.includes('lecturer') ||
            message.includes('teacher')
          ) {
            this.exceptionHandler.throwNotFound({
              code: 'LECTURER_NOT_FOUND',
              message:
                'No lecturer found with the provided credentials. Please contact the MIS administrator.',
            });
          } else if (message.includes('student')) {
            this.exceptionHandler.throwNotFound({
              code: 'STUDENT_NOT_FOUND',
              message:
                'No student found with the provided credentials. Please contact the MIS administrator.',
            });
          } else {
            this.exceptionHandler.throwNotFound({
              code: 'USER_NOT_FOUND',
              message:
                'We could not find a user with the provided credentials in RP MIS system. Please contact the MIS administrator.',
            });
          }
          break;

        case Status.UNAVAILABLE:
          // Check if it's a connection error
          if (
            message.includes('ECONNREFUSED') ||
            message.includes('No connection established')
          ) {
            this.exceptionHandler.throwServiceUnavailable({
              code: 'MIS_CONNECTION_FAILED',
              message:
                'Unable to connect to MIS system. Please contact your MIS administrator.',
            });
          } else {
            this.exceptionHandler.throwServiceUnavailable(
              _503.MIS_INTERNAL_SERVICE_UNAVAILABLE,
            );
          }
          break;

        case Status.UNAUTHENTICATED:
          this.exceptionHandler.throwUnauthorized(
            _401.AUTHENTICATION_WITH_MIS_FAILED,
          );
          break;

        case Status.PERMISSION_DENIED:
          this.exceptionHandler.throwServiceUnavailable({
            code: 'MIS_PERMISSION_DENIED',
            message:
              'Access denied by MIS system. Please contact your MIS administrator.',
          });
          break;

        case Status.INTERNAL:
          this.exceptionHandler.throwServiceUnavailable({
            code: 'MIS_INTERNAL_ERROR',
            message:
              'MIS system is experiencing internal errors. Please contact your MIS administrator.',
          });
          break;

        default:
          this.exceptionHandler.throwServiceUnavailable(
            _503.MIS_INTERNAL_SERVICE_UNAVAILABLE,
          );
      }
    }

    if (error.message && typeof error.message === 'string') {
      if (
        error.message.includes('UNAVAILABLE') &&
        error.message.includes('ECONNREFUSED')
      ) {
        console.error(
          'Detected raw GRPC UNAVAILABLE/Connection error, processing...',
        );
        this.exceptionHandler.throwServiceUnavailable({
          code: 'MIS_CONNECTION_FAILED',
          message:
            'Unable to connect to MIS system. Please contact your MIS administrator.',
        });
      } else if (error.message.includes('NOT_FOUND')) {
        console.error('Detected raw GRPC NOT_FOUND error, processing...');
        const message = error.message;

        if (message.includes('college')) {
          this.exceptionHandler.throwNotFound({
            code: 'COLLEGE_NOT_LINKED',
            message:
              'You are not linked to any college in MIS. Please contact the MIS administrator to assign a college to you.',
          });
        } else if (message.includes('department')) {
          this.exceptionHandler.throwNotFound({
            code: 'DEPARTMENT_NOT_LINKED',
            message:
              'You are not linked to any department in MIS. Please contact the MIS administrator to assign a department to you.',
          });
        } else if (
          message.includes('lecturer') ||
          message.includes('teacher')
        ) {
          this.exceptionHandler.throwNotFound({
            code: 'LECTURER_NOT_FOUND',
            message:
              'No lecturer found with the provided credentials. Please contact the MIS administrator.',
          });
        } else if (message.includes('student')) {
          this.exceptionHandler.throwNotFound({
            code: 'STUDENT_NOT_FOUND',
            message:
              'No student found with the provided credentials. Please contact the MIS administrator.',
          });
        } else {
          this.exceptionHandler.throwNotFound({
            code: 'USER_NOT_FOUND',
            message:
              'We could not find a user with the provided credentials in RP MIS system. Please contact the MIS administrator for assistance.',
          });
        }
      }
    }

    console.error('Not an RpcException, checking for connection errors...');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    if (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('No connection established') ||
      error.message?.includes('connect ECONNREFUSED')
    ) {
      this.exceptionHandler.throwServiceUnavailable({
        code: 'MIS_CONNECTION_FAILED',
        message:
          'Unable to connect to MIS system. Please contact your MIS administrator.',
      });
    }

    if (
      error.code === 14 ||
      (error.message?.includes('UNAVAILABLE') &&
        error.message?.includes('ECONNREFUSED'))
    ) {
      console.error(
        'Detected GRPC UNAVAILABLE/Connection error, processing...',
      );
      this.exceptionHandler.throwServiceUnavailable({
        code: 'MIS_CONNECTION_FAILED',
        message:
          'Unable to connect to MIS system. Please contact your MIS administrator.',
      });
    }

    if (error.code === 5 || error.message?.includes('NOT_FOUND')) {
      console.error('Detected GRPC NOT_FOUND error, processing...');
      const message = error.message || error.details || '';

      if (message.includes('college')) {
        this.exceptionHandler.throwNotFound({
          code: 'COLLEGE_NOT_LINKED',
          message:
            'You are not linked to any college in MIS. Please contact the MIS administrator to assign a college to you.',
        });
      } else if (message.includes('department')) {
        this.exceptionHandler.throwNotFound({
          code: 'DEPARTMENT_NOT_LINKED',
          message:
            'You are not linked to any department in MIS. Please contact the MIS administrator to assign a department to you.',
        });
      } else if (message.includes('lecturer') || message.includes('teacher')) {
        this.exceptionHandler.throwNotFound({
          code: 'LECTURER_NOT_FOUND',
          message:
            'No lecturer found with the provided credentials. Please contact the MIS administrator.',
        });
      } else if (message.includes('student')) {
        this.exceptionHandler.throwNotFound({
          code: 'STUDENT_NOT_FOUND',
          message:
            'No student found with the provided credentials. Please contact the MIS administrator.',
        });
      } else {
        this.exceptionHandler.throwNotFound({
          code: 'USER_NOT_FOUND',
          message:
            'We could not find a user with the provided credentials in RP MIS system. Please contact the MIS administrator for assistance.',
        });
      }
    }

    // Default fallback
    this.exceptionHandler.throwServiceUnavailable(
      _503.MIS_INTERNAL_SERVICE_UNAVAILABLE,
    );
    // This line will never be reached because throwServiceUnavailable throws
    throw new Error('Unreachable code');
  }

  /**
   * Wraps a GRPC call with error handling
   * @param grpcCall - The GRPC call function
   * @param context - Context for error logging
   * @returns Promise with the result or throws appropriate exception
   */
  async wrapGrpcCall<T>(
    grpcCall: () => Promise<T>,
    context: string = 'GRPC call',
  ): Promise<T> {
    try {
      return await grpcCall();
    } catch (error) {
      this.handleGrpcError(error, context);
      // This line will never be reached because handleGrpcError throws
      throw error;
    }
  }
}
