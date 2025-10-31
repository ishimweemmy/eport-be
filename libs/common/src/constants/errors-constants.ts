import {
  DESCRIPTION_MAX_LENGTH,
  SKILL_NAME_MAX_LENGTH,
} from '@customer-service/common/constants/all.constants';

// not found
export const _400 = {
  EMPTY_EXCEL_FILE: {
    code: 'EMPTY_EXCEL_FILE',
    message: 'The excel file is empty',
  },
  YOU_CANNOT_APPROVE_TOPIC_FOR_OTHER_COLLEGE_OR_DEPARTMENT: {
    code: 'YOU_CANNOT_APPROVE_TOPIC_FOR_OTHER_COLLEGE_OR_DEPARTMENT',
    message: 'You can only approve topic for your own college and department',
  },
  YOU_CANNOT_APPROVE_TOPIC_WITH_PENDING_LEAVE_REQUESTS: {
    code: 'YOU_CANNOT_APPROVE_TOPIC_WITH_PENDING_LEAVE_REQUESTS',
    message: 'You cannot approve topic with pending leave requests',
  },
  YOU_CANNOT_LEAVE_PROJECT_IN_THIS_STAGE: {
    code: 'YOU_CANNOT_LEAVE_PROJECT_IN_THIS_STAGE',
    message:
      'You can only leave project in the following stages: Topic Selection, Topic Submitted, Topic Changes Requested',
  },
  USER_NOT_ONBOARDED: {
    code: 'USER_NOT_ONBOARDED',
    message:
      'You are not onboarded yet. You need to create an account before you can continue.',
  },
  PORTFOLIO_NOT_SUBMITTED: {
    code: 'PORTFOLIO_NOT_SUBMITTED',
    message: 'The provided portfolio is not yet submitted',
  },
  INVALID_SEARCH_OPTIONS: {
    code: 'INVALID_SEARCH_OPTIONS',
    message: 'Some search options are missing',
  },
  BAD_FILE_FORMAT: {
    code: 'BAD_REQUEST',
    message: 'You are uploading a file that is not supported ',
  },
  PROJECT_NOT_IN_DEVELOPMENT: {
    code: 'PROJECT_NOT_IN_DEVELOPMENT',
    message: 'The project is not yet in development',
  },
  PROJECT_ALREADY_APPROVED: {
    code: 'PROJECT_ALREADY_APPROVED',
    message: 'The project is already approved',
  },
  EDUCATION_LEVEL_NOT_QUALIFIED: {
    code: 'EDUCATION_LEVEL_NOT_QUALIFIED',
    message:
      'You should be in Level 7 or Level 8 (BTEC) to start an academic project',
  },
  MAXIMUM_COLLABORATORS_REACHED: {
    code: 'MAXIMUM_COLLABORATORS_REACHED',
    message:
      'The collaborators count to be added exceeds the maximum limit for each project',
  },
  TEMPLATE_NOT_ACTIVE_NOT_YET_CONFIGURED: {
    code: 'TEMPLATE_NOT_ACTIVE_NOT_YET_CONFIGURED',
    message:
      'Your have to first configur or activate the template for this stage first',
  },
  INVALID_COLLABORATORS_COUNT: {
    code: 'INVALID_COLLABORATORS_COUNT',
    message: 'The number of collaborators exceeds 10',
  },
  PROJECT_NOT_APPROVED: {
    code: 'PROJECT_NOT_APPROVED',
    message: 'The project is not yet approved',
  },
  PROJECT_NOT_IN_REVIEW: {
    code: 'PROJECT_NOT_IN_REVIEW',
    message: 'Please you have not yet reviewed this project',
  },
  BIO_NOT_EXISTS: {
    code: 'BIO_NOT_EXISTS',
    message: 'You are submitting a portfolio with empty bio',
  },
  INCOMPLETE_SECTIONS_EXIST: {
    code: 'INCOMPLETE_SECTIONS_EXIST',
    message: 'The provided portfolio is not cmplete',
  },
  INVALID_OTP: {
    code: 'INVALID_OTP',
    message: 'The OTP you have provided is invalid or expired ',
  },
  INVALID_ADMIN_REG_CODE: {
    code: 'INVALID_ADMIN_REG_CODE',
    message: 'You provided Invalid admin registion code ',
  },
  INVALID_OLD_PASSWORD: {
    code: 'INVALID_OLD_PASSWORD',
    message: 'The provided old password is invalid',
  },
  FILE_TOO_LARGE: {
    code: 'FILE_TOO_LARGE',
    message: 'The file is too large',
  },
  INVALID_DATA_FOR_TEMPLATE: {
    code: 'INVALID_DATA_FOR_TEMPLATE',
    message: 'The provided data for the template is invalid',
  },
  INVALID_USER_ID: {
    code: 'INVALID_USER_ID',
    message: 'The provided user id is invalid',
  },
  INVALID_USER_ROLE: {
    code: 'INVALID_USER_ROLE',
    message: 'The provided user role is invalid',
  },
  PROJECT_IS_IN_DRAFT: {
    code: 'PROJECT_IS_IN_DRAFT',
    message: 'This action can not be taken on DRAFT projects',
  },
  PROJECT_NOT_IN_TOPIC_SELECTION: {
    code: 'PROJECT_NOT_IN_TOPIC_SELECTION',
    message: 'This projec with provided attributes is not in topic selection',
  },
  PROJECT_ALREADY_PUBLISHED: {
    code: 'PROJECT_ALREADY_PUBLISHED',
    message: 'The project is already published',
  },
  PROJECT_NOT_YET_PUBLISHED: {
    code: 'PROJECT_NOT_YET_PUBLISHED',
    message: 'The project is not yet published',
  },
  PROJECT_NOT_IN_DRAFT: {
    code: 'PROJECT_NOT_IN_DRAFT',
    message: 'This action is for projects that are in draft',
  },
  INVALID_PORTFOLIO_FIELD: {
    code: 'INVALID_PORTFOLIO_FIELD',
    message:
      'The provided portfolio field to remove the item from is not valid',
  },
  PORTFOLIO_URL_EXPIRED: {
    code: 'PORTFOLIO_URL_EXPIRED',
    message: 'The provided portfolio Url was expired',
  },
  INVALID_PORTFOLIO_URL: {
    code: 'INVALID_PORTFOLIO_URL',
    message: 'The provided portfolio Url is invalid',
  },
  PORTFOLIO_ALREADY_SUBMITTED_FOR_REVIEW: {
    code: 'PORTFOLIO_ALREADY_SUBMITTED_FOR_REVIEW',
    message: 'The portfolio is already submitted for QA reviews',
  },
  TOO_LONG_DESCRIPTION: {
    code: 'TOO_LONG_DESCRIPTION',
    message: `The description should be at most ${DESCRIPTION_MAX_LENGTH} characters`,
  },
  TOO_LONG_SKILL_NAME: {
    code: 'TOO_LONG_SKILL_NAME',
    message: `All skills should be at most ${SKILL_NAME_MAX_LENGTH} characters`,
  },
  END_DATE_EARLIER_THAN_TODAY: {
    code: 'END_DATE_EARLIER_THAN_TODAY',
    message: 'The start date should not be earlier than today',
  },
  END_DATE_EARLIER_THAN_OPEN_DATE: {
    code: 'END_DATE_EARLIER_THAN_OPEN_DATE',
    message: 'The end date should not be earlier than the open date',
  },
  START_DATE_LATER_THAN_TODAY: {
    code: 'START_DATE_LATER_THAN_TODAY',
    message: 'The start date should not be later than today',
  },
  END_DATE_EARLIER_THAN_NOW: {
    code: 'END_DATE_EARLIER_THAN_NOW',
    message: 'The end date should not be earlier than now',
  },
  START_DATE_AFTER_END_DATE: {
    code: 'START_DATE_AFTER_END_DATE',
    message: 'The start date should not be later than end date',
  },
  START_DATE_AND_END_DATE_EQUAL: {
    code: 'START_DATE_AND_END_DATE_EQUAL',
    message: 'The start and end dates should not be equal',
  },
  USER_NOT_HOD: {
    code: 'USER_NOT_HOD',
    message: 'No Head of Department exists with the provided attributes',
  },
  USER_IS_HOD: {
    code: 'USER_IS_HOD',
    message: 'No lecturer exists with the provided attributes',
  },
  USER_NOT_TEACHER: {
    code: 'USER_NOT_TEACHER',
    message: 'No lecturer exists with the provided attributes',
  },
  // Research cluster
  RESEARCH_CLUSTER_FULL: {
    code: 'RESEARCH_CLUSTER_FULL',
    message: 'The research cluster is full',
  },
  RESEARCH_CLUSTER_ALREADY_JOINED: {
    code: 'RESEARCH_CLUSTER_ALREADY_JOINED',
    message: 'You have already joined this research cluster',
  },
  RESEARCH_CLUSTER_NOT_ACTIVE: {
    code: 'RESEARCH_CLUSTER_NOT_ACTIVE',
    message: 'The research cluster is not active',
  },
  EITHER_URL_OR_SUPPORTING_DOCUMENTS_IS_REQUIRED: {
    code: 'EITHER_URL_OR_SUPPORTING_DOCUMENTS_IS_REQUIRED',
    message: 'Either the URL or supporting documents is required',
  },
  YOU_CANNOT_LEAVE_YOUR_OWN_PROJECT: {
    code: 'YOU_CANNOT_LEAVE_YOUR_OWN_PROJECT',
    message: 'You cannot leave your own project',
  },
  INSUFFICIENT_BALANCE: {
    code: 'INSUFFICIENT_BALANCE',
    message: 'Insufficient balance to complete this transaction',
  },
  // Loan management
  LOAN_NOT_PENDING_REVIEW: {
    code: 'LOAN_NOT_PENDING_REVIEW',
    message: 'Loan is not in pending review status',
  },
  LOAN_NOT_APPROVED: {
    code: 'LOAN_NOT_APPROVED',
    message: 'Loan must be approved before disbursement',
  },
  // Customer management
  CUSTOMER_ALREADY_SUSPENDED: {
    code: 'CUSTOMER_ALREADY_SUSPENDED',
    message: 'Customer is already suspended',
  },
  CUSTOMER_NOT_SUSPENDED: {
    code: 'CUSTOMER_NOT_SUSPENDED',
    message: 'Customer is not suspended',
  },
};

// unauthorized
export const _401 = {
  ACCOUNT_LOCKED_FOR_LOGIN_ATTEMPTS: {
    code: 'ACCOUNT_LOCKED_FOR_LOGIN_ATTEMPTS',
    message:
      'The maximum number of login attempts has been reached, try again after 5 minutes',
  },
  ACCOUNT_NOT_VERIFIED: {
    code: 'ACCOUNT_NOT_VERIFIED',
    message: 'The account is not yet verified',
  },
  ACCOUNT_NOT_ACTIVE: {
    code: 'ACCOUNT_NOT_ACTIVE',
    message: 'The account is not active',
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid credentials provided',
  },
  AUTHENTICATION_WITH_MIS_FAILED: {
    code: 'AUTHENTICATION_WITH_MIS_FAILED',
    message: 'Authentication with MIS failed, Please contact MIS admin',
  },
  AUTH_INVALID_TOKEN: {
    code: 'AUTH_INVALID_TOKEN',
    message: 'Invalid JWT Token',
  },
  AUTH_TOKEN_EXPIRED: {
    code: 'AUTH_TOKEN_EXPIRED',
    message: 'JWT Token Expired',
  },
  MALFORMED_TOKEN: {
    code: 'MALFORMED_TOKEN',
    message: 'The provided token is malformed.',
  },
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    message: 'The provided token was expired.',
  },
  ACCOUNT_LOCKED_FOR_: {
    code: 'ACCOUNT_LOCKED',
    message: 'This account has been temporarily locked',
  },
};

// forbidden
export const _403 = {
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'You are not authorized to perform this action',
  },
};

// not found
export const _404 = {
  PROJECT_LEAVE_REQUEST_NOT_FOUND: {
    code: 'PROJECT_LEAVE_REQUEST_NOT_FOUND',
    message: 'Project leave request does not exist in the database',
  },
  YOU_ARE_NOT_THE_OWNER_OF_THE_PROJECT: {
    code: 'YOU_ARE_NOT_THE_OWNER_OF_THE_PROJECT',
    message: 'You are not the owner of the project',
  },
  NO_DOCUMENTS_FOUND_FOR_PROJECT: {
    code: 'NO_DOCUMENTS_FOUND_FOR_PROJECT',
    message: 'No documents found for the project',
  },
  EDITOR_DOCUMENT_IS_EMPTY: {
    code: 'EDITOR_DOCUMENT_IS_EMPTY',
    message: 'You can not submit project with empty content',
  },
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'No User exists with provided attributes',
  },
  ONBOARDED_USER_NOT_FOUND: {
    code: 'ONBOARDED_USER_NOT_FOUND',
    message: 'No MIS User exists with provided attributes',
  },
  STUDENT_NOT_FOUND: {
    code: 'STUDENT_NOT_FOUND',
    message: 'No Student exists with provided attributes',
  },
  COMPANY_NOT_FOUND: {
    code: 'COMPANY_NOT_FOUND',
    message: 'No Company exists with provided attributes',
  },
  COMPANY_FOR_LOGGEDIN_USER_NOT_FOUND: {
    code: 'COMPANY_FOR_LOGGEDIN_USER_NOT_FOUND',
    message:
      'The currently loggedIn user is not assigned to any company as admin',
  },
  DATABASE_RECORD_NOT_FOUND: {
    code: 'DATABASE_RECORD_NOT_FOUND',
    message: 'Record does not exist in the database',
  },
  PROJECT_TEMPLATE_NOT_FOUND: {
    code: 'PROJECT_TEMPLATE_NOT_FOUND',
    message: 'Project tempalte does not exist',
  },
  PORTFOLIO_NOT_FOUND: {
    code: 'PORTFOLIO_NOT_FOUND',
    message: 'No portfolio exists with provided attributes',
  },
  NO_PORTFOLIO_OWNED: {
    code: 'PORTFOLIO_NOT_FOUND',
    message: 'The loggedIn profile does not own any portfolio',
  },
  ACADEMIC_MODULE_NOT_FOUND: {
    code: 'ACADEMIC_MODULE_NOT_FOUND',
    message: 'No Acadmic Module exisits with provided attributes',
  },
  FILE_NOT_FOUND: {
    code: 'FILE_NOT_FOUND',
    message:
      'This means that the file, you are trying to access does not exist',
  },
  NOTIFICATION_REGISTRY_NOT_FOUND: {
    code: 'NOTIFICATION_REGISTRY_NOT_FOUND',
    message: 'Notification Registry not found',
  },
  PROJECT_NOT_FOUND: {
    code: 'PROJECT_NOT_FOUND',
    message: 'Project does not exist in the database',
  },
  NO_ACADEMIC_PROJECT_FOUND_FOR_LOGGEDIN_USER: {
    code: 'NO_ACADEMIC_PROJECT_FOUND_FOR_LOGGEDIN_USER',
    message: 'No academic project found for the logged in user',
  },
  PROJECT_FOR_OWNER_NOT_FOUND: {
    code: 'PROJECT_FOR_OWNER_NOT_FOUND',
    message: 'The provided owner do not own any project',
  },
  PROJECT_COLLABORATOR_NOT_FOUND: {
    code: 'PROJECT_COLLABORATOR_NOT_FOUND',
    message: 'Project collaborator does not exist in the database',
  },
  EDITOR_DOCUMENT_NOT_FOUND: {
    code: 'EDITOR_DOCUMENT_NOT_FOUND',
    message: 'Editor document does not exist in the database',
  },
  MIS_INFO_NOT_FOUND: {
    code: 'MIS_INFO_NOT_FOUND',
    message: 'The MIS information expired',
  },
  ACADEMIC_PROJECT_NOT_FOUND: {
    code: 'ACADEMIC_PROJECT_NOT_FOUND',
    message: 'Project does not exist in the database',
  },
  SUPERVISION_MEETING_NOT_FOUND: {
    code: 'SUPERVISION_MEETING_NOT_FOUND',
    message: 'Supervision meeting does not exist in the database',
  },
  PROGRAM_NOTFOUND: {
    code: 'PROGRAM_NOTFOUND',
    message: 'The program with the provided ID is not found',
  },
  DEPARTMENT_NOTFOUND: {
    code: 'DEPARTMENT_NOTFOUND',
    message: 'The department with the provided ID is not found',
  },
  PANEL_ASSIGNMENT_NOTFOUND: {
    code: 'PANEL_ASSIGNMENT_NOTFOUND',
    message: 'Panel assign does not exist in the database',
  },
  PRE_DEFENSE_MEETING_NOT_FOUND: {
    code: 'PRE_DEFENSE_MEETING_NOT_FOUND',
    message: 'predefense meeting does not exisit in the database',
  },
  DEFENSE_PANEL_NOT_FOUND: {
    code: 'DEFENSE_PANEL_NOT_FOUND',
    message: 'defense panel does not exist in the database',
  },
  PROJECT_SUBMISSION_NOT_FOUND: {
    code: 'PROJECT_SUBMISSION_NOT_FOUND',
    message: 'project sumission does not exist in the database',
  },
  AWARD_NOT_FOUND: {
    code: 'AWARD_NOT_FOUND',
    message: 'Award does not exist in the database',
  },
  EXTRA_CURRICULAR_ACTIVITY_NOT_FOUND: {
    code: 'EXTRA_CURRICULAR_ACTIVITY_NOT_FOUND',
    message: 'Extracurricular activity does not exist in the database',
  },
  PROFESSIONAL_EXPERIENCE_NOT_FOUND: {
    code: 'PROFESSIONAL_EXPERIENCE_NOT_FOUND',
    messagee: 'The professinal exprience does not exist in the database',
  },
  TOPIC_SUBMISSION_NOT_FOUND: {
    code: 'TOPIC_SUBMISSION_NOT_FOUND',
    message: 'Topic sumission does not exist in the database',
  },
  DEFENSE_MEETING_NOT_FOUND: {
    code: 'DEFENSE_MEETING_NOT_FOUND',
    message: 'Supervision meeting does not exist in the database',
  },
  SHOWCASE_NOT_FOUND: {
    code: 'SHOWCASE_NOT_FOUND',
    message: 'The showcase with provided attributes does not found',
  },
  SECTOR_NOT_FOUND: {
    code: 'SECTOR_NOT_FOUND',
    message: 'The sector with provided attributes does not found',
  },
  COMMENT_NOT_FOUND: {
    code: 'COMMENT_NOT_FOUND',
    message: 'The comment with provided attributes does not found',
  },
  SUGGESTION_NOT_FOUND: {
    code: 'SUGGESTION_NOT_FOUND',
    message: 'The suggestion with provided attributes does not found',
  },

  // Research output
  RESEARCH_OUTPUT_NOT_FOUND: {
    code: 'RESEARCH_OUTPUT_NOT_FOUND',
    message: 'The research output with provided attributes does not found',
  },
  RESEARCH_CLUSTER_NOT_FOUND: {
    code: 'RESEARCH_CLUSTER_NOT_FOUND',
    message: 'The research cluster with provided attributes does not found',
  },

  //Grant
  GRANT_NOT_FOUND: {
    code: 'GRANT_NOT_FOUND',
    message: 'The grant with provided attributes does not found',
  },

  // Credit Jambo
  CUSTOMER_NOT_FOUND: {
    code: 'CUSTOMER_NOT_FOUND',
    message: 'Customer not found',
  },
  LOAN_NOT_FOUND: {
    code: 'LOAN_NOT_FOUND',
    message: 'Loan not found',
  },
  CREDIT_ACCOUNT_NOT_FOUND: {
    code: 'CREDIT_ACCOUNT_NOT_FOUND',
    message: 'Credit account not found',
  },
};

// conflict
export const _409 = {
  USER_ALREADY_EXISTS: {
    code: 'USER_ALREADY_EXISTS',
    message: 'User already exists',
  },
  USER_ALREADY_ONBOARDED: {
    code: 'USER_ALREADY_ONBOARDED',
    message: 'You are already onboarded please login',
  },
  POSITION_ALREADY_EXISTS: {
    code: 'POSITION_ALREADY_EXISTS',
    message: 'The provided position already exists in the portfolio',
  },
  RECOMMENDATION_ALREADY_EXISTS: {
    code: 'RECOMMENDATION_ALREADY_EXISTS',
    message: 'You have already recommeded this student',
  },
  COMPANY_ALREADY_EXISTS: {
    code: 'COMPANY_ALREADY_EXISTS',
    message: 'The company with provided attributes is already registered',
  },
  TEMPLATE_ALREADY_EXISTS: {
    code: 'TEMPLATE_ALREADY_EXISTS',
    message: 'The provided template is already registered',
  },
  DATABASE_RECORD_ALREADY_EXISTS: {
    code: 'DATABASE_RECORD_ALREADY_EXISTS',
    message: 'Record already exists in the database',
  },
  COLLEGE_ALREADY_EXISTS: {
    code: 'COLLEGE_ALREADY_EXISTS',
    message: 'The college with provided attributes is already registered',
  },
  FOREIGN_KEY_VIOLATION: {
    code: 'FOREIGN_KEY_VIOLATION',
    message: 'Referenced record does not exist',
  },
  PROJECT_COLLABORATOR_ALREADY_EXISTS: {
    code: 'PROJECT_COLLABORATOR_ALREADY_EXISTS',
    message: 'project collaborator already exist',
  },
  PROJECT_WITH_TITLE_ALREADY_EXISTS: {
    code: 'PROJECT_WITH_TITLE_ALREADY_EXISTS',
    message: 'project witht the same title already exist',
  },
  PROJECT_WITH_PENDING_REVIEWER_COMMENTS: {
    code: 'PROJECT_WITH_PENDING_REVIEWER_COMMENTS',
    message: 'project has pending reviewer comment',
  },
  INNOVATION_PROJECT_REQUIRES_INCUBATION_STAFF_REVIEWER: {
    code: 'INNOVATION_PROJECT_REQUIRES_INCUBATION_STAFF_REVIEWER',
    message: 'innovation project requires incubation staff supervisor/reviwer',
  },
  RESEARCH_PROJECT_REQUIRES_LECTURE_REVIEWER: {
    code: 'RESEARCH_PROJECT_REQUIRES_LECTURE_REVIEWER',
    message: 'research project requires lecture supervisor/reviwer',
  },
  HOD_ASSIGNS_SUPERVISOR_TO_ACADEMIC_PROJECT: {
    code: 'HoD_ASSIGNS_SUPERVISOR_TO_ACADEMIC_PROJECT',
    message: 'HoD assigns supervisor/reviwer to academic project',
  },
  AT_LEAST_THREE_SUPERVISION_MEETING_IS_REQUIRED: {
    code: 'AT_LEAST_THREE_SUPERVISION_MEETING_IS_REQUIRED',
    message:
      'At least three supervision meetings are required to submit project for review',
  },
  STUDENT_ALREADY_HAS_ACADEMIC_PROJECT: {
    code: 'STUDENT_ALREADY_HAS_ACADEMIC_PROJECT',
    message: 'Student already has academic project',
  },
  YOU_CAN_ONLY_INVITE_STUDENTS_TO_YOUR_ACADEMIC_PROJECT: {
    code: 'YOU_CAN_ONLY_INVITE_STUDENTS_TO_YOUR_ACADEMIC_PROJECT',
    message: 'You can only invite students to your academic project',
  },
  YOU_CAN_ONLY_INVITE_3_STUDENTS: {
    code: 'YOU_CAN_ONLY_INVITE_3_STUDENTS',
    message: 'You can only invite 3 students to your academic project',
  },
  THERE_ARE_PENDING_COLLABORATORS: {
    code: 'THERE_ARE_PENDING_COLLABORATORS',
    message: "You can't submit topic because there are pending collaborators",
  },
  YOU_CAN_ONLY_INVITE_STUDENT_FROM_YEAR_3: {
    code: 'YOU_CAN_ONLY_INVITE_STUDENT_FROM_YEAR_3',
    message: 'You can only a student from level 7 or btec',
  },
  PROJECT_WITH_PENDING_SUPERVISORS: {
    code: 'PROJECT_WITH_PENDING_SUPERVISORS',
    message: 'Project has pending supervisor(s)',
  },

  // success story
  SUCCESS_STORY_ALREADY_EXISTS: {
    code: 'SUCCESS_STORY_ALREADY_EXISTS',
    message: 'The success story already exists',
  },
};

// internal server error
export const _500 = {
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'The service is temporarily not available',
  },
};

// service unavailable
export const _503 = {
  EXTERNAL_SERVICE_UNAVAILABLE: {
    code: 'EXTERNAL_SERVICE_UNAVAILABLE',
    message: 'External service is temporarily unavailable',
  },
  MIS_INTERNAL_SERVICE_UNAVAILABLE: {
    code: 'MIS_INTERNAL_SERVICE_UNAVAILABLE',
    message:
      'Authentication failed due to an MIS system error. Please contact your MIS administrator.',
  },
};

type ValueOf<T> = T[keyof T];

export type TypeOfError =
  | ValueOf<typeof _400>
  | ValueOf<typeof _401>
  | ValueOf<typeof _403>
  | ValueOf<typeof _404>
  | ValueOf<typeof _409>
  | ValueOf<typeof _500>
  | ValueOf<typeof _503>;
