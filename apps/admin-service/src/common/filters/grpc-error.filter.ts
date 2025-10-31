import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { Response } from 'express';

@Catch(RpcException)
export class GrpcErrorFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const grpcError = exception.getError() as any;

    let status = HttpStatus.SERVICE_UNAVAILABLE;
    let message =
      'MIS service is currently unavailable. Please contact your MIS administrator.';
    let code = 'MIS_SERVICE_UNAVAILABLE';

    // Map GRPC error codes to HTTP status codes and user-friendly messages
    switch (grpcError.code) {
      case Status.NOT_FOUND:
        status = HttpStatus.SERVICE_UNAVAILABLE;
        if (grpcError.message.includes('department')) {
          code = 'MIS_DEPARTMENT_SERVICE_UNAVAILABLE';
          message =
            'Department information is currently unavailable. Please contact your MIS administrator.';
        } else if (grpcError.message.includes('college')) {
          code = 'MIS_COLLEGE_SERVICE_UNAVAILABLE';
          message =
            'College information is currently unavailable. Please contact your MIS administrator.';
        } else if (
          grpcError.message.includes('lecturer') ||
          grpcError.message.includes('teacher')
        ) {
          code = 'MIS_LECTURER_SERVICE_UNAVAILABLE';
          message =
            'Lecturer information is currently unavailable. Please contact your MIS administrator.';
        } else if (grpcError.message.includes('student')) {
          code = 'MIS_STUDENT_SERVICE_UNAVAILABLE';
          message =
            'Student information is currently unavailable. Please contact your MIS administrator.';
        } else {
          code = 'MIS_SERVICE_UNAVAILABLE';
          message =
            'MIS service is currently unavailable. Please contact your MIS administrator.';
        }
        break;

      case Status.UNAVAILABLE:
        status = HttpStatus.SERVICE_UNAVAILABLE;
        code = 'MIS_INTERNAL_SERVICE_UNAVAILABLE';
        message =
          'Authentication failed due to an MIS system error. Please contact your MIS administrator.';
        break;

      case Status.UNAUTHENTICATED:
        status = HttpStatus.UNAUTHORIZED;
        code = 'AUTHENTICATION_WITH_MIS_FAILED';
        message = 'Authentication with MIS failed, Please contact MIS admin';
        break;

      case Status.PERMISSION_DENIED:
        status = HttpStatus.SERVICE_UNAVAILABLE;
        code = 'MIS_PERMISSION_DENIED';
        message =
          'Access denied by MIS system. Please contact your MIS administrator.';
        break;

      case Status.INTERNAL:
        status = HttpStatus.SERVICE_UNAVAILABLE;
        code = 'MIS_INTERNAL_ERROR';
        message =
          'MIS system is experiencing internal errors. Please contact your MIS administrator.';
        break;

      default:
        status = HttpStatus.SERVICE_UNAVAILABLE;
        code = 'MIS_SERVICE_UNAVAILABLE';
        message =
          'MIS service is currently unavailable. Please contact your MIS administrator.';
    }

    response.status(status).json({
      statusCode: status,
      error: code,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }
}
