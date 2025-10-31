import { Status } from '@grpc/grpc-js/build/src/constants';

export const GRPC_ERRORS = {
  INVALID_ARGUMENT: {
    code: Status.INVALID_ARGUMENT,
    message: 'Invalid argument/parameter provided',
  },
  NOT_FOUND: {
    code: Status.NOT_FOUND,
    message: 'Resource not found',
  },
  STUDENT_NOT_FOUND: {
    code: Status.NOT_FOUND,
    message: 'No Student exists with provided attributes',
  },
  NO_DEPARTMENT_FOUND_FOR_LECTURER: {
    code: Status.NOT_FOUND,
    message:
      'You are not linked to any department in MIS, Please contact the MIS administrator to assign a department to you',
  },
  NO_COLLEGE_FOUND_FOR_LECTURER: {
    code: Status.NOT_FOUND,
    message:
      'You are not linked to any college in MIS, Please contact the MIS administrator to assign a college to you',
  },
  NO_DEPARTMENT_FOUND_FOR_STUDENT: {
    code: Status.NOT_FOUND,
    message:
      'You are not linked to any department in MIS, Please contact the MIS administrator to assign a department to you',
  },
  NO_COLLEGE_FOUND_FOR_STUDENT: {
    code: Status.NOT_FOUND,
    message:
      'You are not linked to any college in MIS, Please contact the MIS administrator to assign a college to you',
  },
  COLLEGE_NOT_FOUND: {
    code: Status.NOT_FOUND,
    message: 'No College exists with provided attributes',
  },
  HOD_NOT_FOUND: {
    code: Status.NOT_FOUND,
    message: 'No HOD in MIS corresponding to the provided user',
  },

  NO_INDUSTRIAL_ATTACHMENT_FOUND_FOR_STUDENT: {
    code: Status.NOT_FOUND,
    message: 'No Industrial attachment exists with provided attributes',
  },
  DEPARTMENT_NOT_FOUND: {
    code: Status.NOT_FOUND,
    message: 'No Department exists with provided attributes',
  },
  LECTURER_NOT_FOUND: {
    code: Status.NOT_FOUND,
    message: 'No Lecture exists with provided attributes',
  },
  ALREADY_EXISTS: {
    code: Status.ALREADY_EXISTS,
    message: 'Resource already exists',
  },
  PERMISSION_DENIED: {
    code: Status.PERMISSION_DENIED,
    message: 'Permission denied',
  },
  UNAUTHENTICATED: {
    code: Status.UNAUTHENTICATED,
    message: 'Unauthenticated request',
  },
  INTERNAL: {
    code: Status.INTERNAL,
    message: 'Internal server error',
  },
  UNAVAILABLE: {
    code: Status.UNAVAILABLE,
    message: 'Service unavailable',
  },
  STUDENT_MARKS_NOT_FOUND: {
    code: Status.NOT_FOUND,
    message: 'No student marks exists with provided attributes',
  },
  USER_NOT_FOUND: {
    code: Status.NOT_FOUND,
    message: 'No user exists with provided attributes',
  },
};

export type GrpcErrorType = (typeof GRPC_ERRORS)[keyof typeof GRPC_ERRORS];
