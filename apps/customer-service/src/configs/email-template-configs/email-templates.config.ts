import { AcademicProjectSupervisionMeetingScheduledDto } from '@customer-service/integrations/notification/dto/emails/academic-project-supervision-meeting-scheduled.dto';
import { AccountEmailChangeDto } from '@customer-service/integrations/notification/dto/emails/account-email-change.dto';
import {
  ActivateAccountDto,
  NotifyHodAboutTeacherDeactivationDto,
  NotifyOwnerAboutCollaboratorDeactivationDto,
  NotifyOwnerAboutCollaboratorReactivationDto,
  NotifyStudentAboutSupervisorDeactivationDto,
  NotifyStudentAboutSupervisorReactivationDto,
  StudentAccountDeactivationDto,
  StudentAccountReactivationDto,
  TeacherAccountDeactivationDto,
  TeacherAccountReactivationDto,
} from '@customer-service/integrations/notification/dto/emails/activate-or-deactivate-account.dto';
import { CoSuperVisorDto } from '@customer-service/integrations/notification/dto/emails/co-supervisor.dto';
import { NewLoginDto } from '@customer-service/integrations/notification/dto/emails/new-login.dto';
import { PanelAssignmentDto } from '@customer-service/integrations/notification/dto/emails/panel-assignment.dto';
import { PasswordResetDto } from '@customer-service/integrations/notification/dto/emails/password-reset.dto';
import { PortfolioApprovalDto } from '@customer-service/integrations/notification/dto/emails/porfolio-approval.dto';
import { PortfoliRevisionRequiredDto } from '@customer-service/integrations/notification/dto/emails/portfolio-revision-required.dto';
import { ProjectCollaborationReplyDto } from '@customer-service/integrations/notification/dto/emails/project-collaboration-reply.dto';
import { ProjectCollaborationRequestDto } from '@customer-service/integrations/notification/dto/emails/project-collaboration-request.dto';
import { ProjectPublicationDto } from '@customer-service/integrations/notification/dto/emails/project-publication.dto';
import { ProjectStatusChangeDto } from '@customer-service/integrations/notification/dto/emails/project-status-change.dto';
import { StudentConceptPaperSupervisorDto } from '@customer-service/integrations/notification/dto/emails/student-concept-paper-supervisor-action.dto';
import { StudentDefensePresentationScheduledDto } from '@customer-service/integrations/notification/dto/emails/student-defense-presentation-scheduled.dto';
import { StudentEditorDocumentCommentDto } from '@customer-service/integrations/notification/dto/emails/student-editor-document.dto';
import { StudentHodTopicResponseDto } from '@customer-service/integrations/notification/dto/emails/student-hod-topic-response';
import { StudentPanelReviewScheduledDto } from '@customer-service/integrations/notification/dto/emails/student-panel-review-scheduled.dto';
import { StudentProjectPublicationOrRejectionto } from '@customer-service/integrations/notification/dto/emails/student-project-publication-or-rejetion.dto';
import { StudentProposalPresentationFeedbackDto } from '@customer-service/integrations/notification/dto/emails/student-proposal-presentation-feedback.dto';
import { StudentRecommendationDto } from '@customer-service/integrations/notification/dto/emails/student-recommendation.dto';
import { StudentSupervisionMeetingCompletedDto } from '@customer-service/integrations/notification/dto/emails/student-supervision-meeting-completed.dto';
import { StudentSupervisorAssignmentDto } from '@customer-service/integrations/notification/dto/emails/student-supervisor-assignment.dto';
import { StudentTopicSubmissionDto } from '@customer-service/integrations/notification/dto/emails/student-topic-submission.dto';
import { SupervisorAssignemtDto } from '@customer-service/integrations/notification/dto/emails/supervisor-assignment.dto';
import { SupervisorConceptPaperSubmissionDto } from '@customer-service/integrations/notification/dto/emails/supervisor-concept-paper-submission.dto';
import { SupervisorHodPanelAssignment } from '@customer-service/integrations/notification/dto/emails/supervisor-hod-panel-assignment.dto';
import { SupervisorNewProjectDto } from '@customer-service/integrations/notification/dto/emails/supervisor-new-project';
import { SupervisorPostDefenseRevisionSubmited } from '@customer-service/integrations/notification/dto/emails/supervisor-post-defense-revision-submited.dto';
import { SupervisorProjectVerdictDto } from '@customer-service/integrations/notification/dto/emails/supervisor-project-verditct.dto';
import { UserOnboardVerificationDto } from '@customer-service/integrations/notification/dto/emails/user-onboard-verification.dto';
import { VerificationEmailDto } from '@customer-service/integrations/notification/dto/emails/verification.email.dto';
import { WelcomeEmailDto } from '@customer-service/integrations/notification/dto/emails/welcome.email.dto';
import { TwoFactorAuthStatusChangeDto } from '@customer-service/integrations/notification/dto/emails/two-factor-auth-status-change.dto';
import { EmailNotificationsStatusChangeDto } from '@customer-service/integrations/notification/dto/emails/email-notifications-status-change.dto';
import { HodTopicSubmissionDto } from '@customer-service/integrations/notification/dto/emails/hod-topic-submission.dto';
import { BaseEmailDto } from '@customer-service/integrations/notification/dto/emails/base-email.dto';
import { ResendOtpDto } from '@customer-service/integrations/notification/dto/emails/resend-otp.dto';
import { CustomerRegistrationDto } from '@customer-service/integrations/notification/dto/emails/customer-registration.dto';
import { DepositSuccessDto } from '@customer-service/integrations/notification/dto/emails/deposit-success.dto';
import { WithdrawalSuccessDto } from '@customer-service/integrations/notification/dto/emails/withdrawal-success.dto';
import { LoanApprovedDto } from '@customer-service/integrations/notification/dto/emails/loan-approved.dto';
import { LoanDisbursedDto } from '@customer-service/integrations/notification/dto/emails/loan-disbursed.dto';
import { RepaymentReceivedDto } from '@customer-service/integrations/notification/dto/emails/repayment-received.dto';
import { RepaymentDueDto } from '@customer-service/integrations/notification/dto/emails/repayment-due.dto';
import { PaymentOverdueDto } from '@customer-service/integrations/notification/dto/emails/payment-overdue.dto';
import { LoanDefaultedDto } from '@customer-service/integrations/notification/dto/emails/loan-defaulted.dto';
import { TierUpgradeDto } from '@customer-service/integrations/notification/dto/emails/tier-upgrade.dto';
import { LateFeeAppliedDto } from '@customer-service/integrations/notification/dto/emails/late-fee-applied.dto';
import { InterestCreditedDto } from '@customer-service/integrations/notification/dto/emails/interest-credited.dto';
import { LoanRejectedDto } from '@customer-service/integrations/notification/dto/emails/loan-rejected.dto';
import { CreditLimitUpdatedDto } from '@customer-service/integrations/notification/dto/emails/credit-limit-updated.dto';
import { CreditScoreUpdatedDto } from '@customer-service/integrations/notification/dto/emails/credit-score-updated.dto';
import { AccountSuspendedDto } from '@customer-service/integrations/notification/dto/emails/account-suspended.dto';
import { AccountUnsuspendedDto } from '@customer-service/integrations/notification/dto/emails/account-unsuspended.dto';

export enum EmailTemplates {
  WELCOME = 'welcome',
  WELCOME_COMPANY_ADMIN = 'welcome-email',
  VERIFICATION = 'verify-email',
  RESEND_OTP = 'resend-otp',
  USER_ONBOARDING_VERIFICATION = 'user-onboarding-verification',

  // Account Activation and Deactivation
  ACTIVATION = 'activate-account',
  STUDENT_ACCOUNT_DEACTIVATION = 'student-account-deactivation',
  STUDENT_ACCOUNT_REACTIVATION = 'student-account-reactivation',
  TEACHER_ACCOUNT_DEACTIVATION = 'teacher-account-deactivation',
  TEACHER_ACCOUNT_REACTIVATION = 'teacher-account-reactivation',
  HOD_ACCOUNT_DEACTIVATION = 'hod-account-deactivation',
  INCUBATOR_ACCOUNT_DEACTIVATION = 'incubator-account-deactivation',
  QUALITY_ASSURANCE_ACCOUNT_DEACTIVATION = 'quality-assurance-account-deactivation',
  NOTIFY_OWNER_ABOUT_COLLABORATOR_DEACTIVATION = 'notify-owner-about-collaborator-deactivation',
  NOTIFY_OWNER_ABOUT_COLLABORATOR_REACTIVATION = 'notify-owner-about-collaborator-reactivation',
  NOTIFY_STUDENT_ABOUT_SUPERVISOR_REACTIVATION = 'notify-student-about-supervisor-reactivation',
  NOTIFY_STUDENT_ABOUT_SUPERVISOR_DEACTIVATION = 'notify-student-about-supervisor-deactivation',
  NOTIFY_HOD_ABOUT_TEACHER_DEACTIVATION = 'notify-hod-about-teacher-deactivation',

  PROJECT_PUBLICATION = 'project-publication',
  SUPERVISOR_ASSIGNEMT = 'supervisor-assignment',
  PANEL_ASSIGNEMTENT = 'panel-assignment',
  CO_SUPERVISOR = 'co-supervisor',
  SUPERVISOR_NEW_PROJECT = 'supervisor-new-project',
  SUPERVISOR_CONCEPT_PAPER_SUBMISSION = 'supervisor-concept-paper-submission',
  SUPERVISOR_HOD_PANEL_ASSIGNMENT = 'supervisor-hod-panel-assignment',
  SUPERVISOR_HOD_DEFENSE_PANEL_ASSIGNMENT = 'supervisor-hod-defense-panel-assignment',
  SUPERVISOR_PROJECT_VERDICT = 'supervisor-project-verdict',
  PROJECT_STATUS_CHANGE = 'project-status-change',
  SUPERVISOR_PROJECT_POST_DEFENSE_REVISIONS_SUBMITED = 'supervisor-project-post-defense-revisions-submited',
  NEW_LOGIN = 'new-login',
  FAILED_LOGIN_ATTEMPT = 'failed-login-attempt',
  PASSWORD_RESET = 'password-reset',
  ACCOUNT_EMAIL_CHANGE = 'account-email-change',
  PORTFOLIO_APPROVAL = 'portfolio-approval',
  PORTFOLIO_REVISION_REQUIRED = 'portfolio-revision-required',
  STUDENT_TOPIC_SUBMISSION = 'student-topic-submission',
  STUDENT_HOD_TOPIC_RESPONSE = 'student-hod-topic-response',
  STUDENT_SUPERVISOR_ASSIGNMENT = 'student-supervisor-assignment',
  ACADEMIC_PROJECT_SUPERVISION_MEETING_SCHEDULED = 'academic-project-supervision-meeting-scheduled',
  STUDENT_SUPERVISION_MEETING_COMPLETED = 'student-supervision-meeting-completed',
  STUDENT_CONCEPT_PAPER_SUPERVISOR_ACTION = 'student-concept-paper-supervisor-action',
  STUDENT_PANEL_REVIEW_SCHEDULED = 'student-panel-review-scheduled',
  STUDENT_PROPOSAL_PRESENTATION_FEEDBACK = 'student-proposal-presentation-feedback',
  STUDENT_DEFENSE_PRESENTATION_SCHEDULED = 'student-defense-presentation-scheduled',
  STUDENT_DEFENSE_PRESENTATION_FEEDBACK = 'student-defense-presentation-feedback',
  STUDENT_EDITOR_DOCUMENT_COMMENT = 'student-editor-document-comment',
  PROJECT_COLLABORATION_REQUEST = 'project-collaboration-request',
  PROJECT_COLLABORATION_REPLY = 'project-collaboration-reply',
  STUDENT_PROJECT_CHANGES_REQUESTED = 'student-project-publication-or-rejection',
  STUDENT_NEW_PORTFOLIO_RECOMMENDATION = 'student-new-portfolio-recommendation',
  STUDENT_PORTFOLIO_RECOMMENDATION_UPDATE = 'student-portfolio-recommendation-update',
  TWO_FACTOR_AUTH_STATUS_CHANGE = 'two-factor-auth-status-change',
  EMAIL_NOTIFICATIONS_STATUS_CHANGE = 'email-notifications-status-change',
  HOD_TOPIC_SUBMISSION = 'hod-topic-submission',
  HOD_PROPOSAL_APPROVAL_FROM_SUPERVISOR = 'hod-proposal-approval-from-supervisor',
  EMAIL_TEMPLATE = 'email-template',

  // Credit Jambo Templates
  CUSTOMER_REGISTRATION = 'customer-registration',
  DEPOSIT_SUCCESS = 'deposit-success',
  INTEREST_CREDITED = 'interest-credited',
  LATE_FEE_APPLIED = 'late-fee-applied',
  LOAN_APPROVED = 'loan-approved',
  LOAN_REJECTED = 'loan-rejected',
  LOAN_DEFAULTED = 'loan-defaulted',
  LOAN_DISBURSED = 'loan-disbursed',
  PAYMENT_OVERDUE = 'payment-overdue',
  REPAYMENT_DUE = 'repayment-due',
  REPAYMENT_RECEIVED = 'repayment-received',
  TIER_UPGRADE = 'tier-upgrade',
  WITHDRAWAL_SUCCESS = 'withdrawal-success',

  // Admin Actions
  CREDIT_LIMIT_UPDATED = 'credit-limit-updated',
  CREDIT_SCORE_UPDATED = 'credit-score-updated',
  ACCOUNT_SUSPENDED = 'account-suspended',
  ACCOUNT_UNSUSPENDED = 'account-unsuspended',
}

export const EMAIL_TEMPLATES_CONFIG = {
  [EmailTemplates.WELCOME]: {
    subject: 'Welcome to RP E-porfolio!',
    dto: BaseEmailDto,
  },
  [EmailTemplates.WELCOME_COMPANY_ADMIN]: {
    subject: 'Welcome to RP E-porfolio!',
    dto: WelcomeEmailDto,
  },
  [EmailTemplates.RESEND_OTP]: {
    subject: 'Verify Your Email',
    dto: ResendOtpDto,
  },

  // Account Activation and Deactivation

  [EmailTemplates.ACTIVATION]: {
    subject: 'Activate your account!',
    dto: ActivateAccountDto,
  },
  [EmailTemplates.STUDENT_ACCOUNT_REACTIVATION]: {
    subject: 'Important: Your RP E-Portfolio Student Account Reactivation',
    dto: StudentAccountReactivationDto,
  },
  [EmailTemplates.STUDENT_ACCOUNT_DEACTIVATION]: {
    subject: 'Important: Your RP E-Portfolio Student Account Deactivation',
    dto: StudentAccountDeactivationDto,
  },
  [EmailTemplates.TEACHER_ACCOUNT_REACTIVATION]: {
    subject: 'Important: Your RP E-Portfolio Teacher Account Reactivation',
    dto: TeacherAccountReactivationDto,
  },
  [EmailTemplates.TEACHER_ACCOUNT_DEACTIVATION]: {
    subject: 'Important: Your RP E-Portfolio Teacher Account Deactivation',
    dto: TeacherAccountDeactivationDto,
  },
  [EmailTemplates.HOD_ACCOUNT_DEACTIVATION]: {
    subject: 'Important: Your RP E-Portfolio HOD Account Deactivation',
    dto: TeacherAccountDeactivationDto,
  },
  [EmailTemplates.INCUBATOR_ACCOUNT_DEACTIVATION]: {
    subject: 'Important: Your RP E-Portfolio Incubator Account Deactivation',
    dto: TeacherAccountDeactivationDto,
  },
  [EmailTemplates.QUALITY_ASSURANCE_ACCOUNT_DEACTIVATION]: {
    subject:
      'Important: Your RP E-Portfolio Quality Assurance Account Deactivation',
    dto: TeacherAccountDeactivationDto,
  },
  [EmailTemplates.NOTIFY_STUDENT_ABOUT_SUPERVISOR_REACTIVATION]: {
    subject: 'Important: Your RP E-Portfolio Supervisor Account Reactivation',
    dto: NotifyStudentAboutSupervisorReactivationDto,
  },
  [EmailTemplates.NOTIFY_STUDENT_ABOUT_SUPERVISOR_DEACTIVATION]: {
    subject: 'Important: Your RP E-Portfolio Supervisor Account Deactivation',
    dto: NotifyStudentAboutSupervisorDeactivationDto,
  },
  [EmailTemplates.NOTIFY_OWNER_ABOUT_COLLABORATOR_DEACTIVATION]: {
    subject: 'Project Collaboration Update: Team Member Status Change',
    dto: NotifyOwnerAboutCollaboratorDeactivationDto,
  },
  [EmailTemplates.NOTIFY_OWNER_ABOUT_COLLABORATOR_REACTIVATION]: {
    subject: 'Project Collaboration Update: Team Member Status Change',
    dto: NotifyOwnerAboutCollaboratorReactivationDto,
  },
  [EmailTemplates.NOTIFY_HOD_ABOUT_TEACHER_DEACTIVATION]: {
    subject: 'ACTION REQUIRED: Faculty Account Deactivation',
    dto: NotifyHodAboutTeacherDeactivationDto,
  },

  [EmailTemplates.VERIFICATION]: {
    subject: 'Verify Your Email',
    dto: VerificationEmailDto,
  },
  [EmailTemplates.USER_ONBOARDING_VERIFICATION]: {
    subject: 'Welcome! Verify Your Email',
    dto: UserOnboardVerificationDto,
  },

  [EmailTemplates.PROJECT_PUBLICATION]: {
    subject: 'Your project is approved',
    dto: ProjectPublicationDto,
  },
  [EmailTemplates.SUPERVISOR_ASSIGNEMT]: {
    subject: 'A supervisor is attached to your project',
    dto: SupervisorAssignemtDto,
  },
  [EmailTemplates.PANEL_ASSIGNEMTENT]: {
    subject: 'A panel presentation is assigned to your project ',
    dto: PanelAssignmentDto,
  },
  [EmailTemplates.CO_SUPERVISOR]: {
    subject: 'You have been added to a project',
    dto: CoSuperVisorDto,
  },
  [EmailTemplates.SUPERVISOR_NEW_PROJECT]: {
    subject: 'HoD has assigned you as supervisor for a project',
    dto: SupervisorNewProjectDto,
  },
  [EmailTemplates.SUPERVISOR_CONCEPT_PAPER_SUBMISSION]: {
    subject: 'New concept paper submitted by a student',
    dto: SupervisorConceptPaperSubmissionDto,
  },
  [EmailTemplates.SUPERVISOR_HOD_PANEL_ASSIGNMENT]: {
    subject: 'You have been assigned as as proposal meeting panelist',
    dto: SupervisorHodPanelAssignment,
  },
  [EmailTemplates.SUPERVISOR_HOD_DEFENSE_PANEL_ASSIGNMENT]: {
    subject: 'You have been assigned as as defense meeting panelist',
    dto: SupervisorHodPanelAssignment,
  },
  [EmailTemplates.SUPERVISOR_PROJECT_VERDICT]: {
    subject: "Defense verdict required for a student's presentation",
    dto: SupervisorProjectVerdictDto,
  },
  [EmailTemplates.PROJECT_STATUS_CHANGE]: {
    subject: "Student's project status change",
    dto: ProjectStatusChangeDto,
  },
  [EmailTemplates.SUPERVISOR_PROJECT_POST_DEFENSE_REVISIONS_SUBMITED]: {
    subject: 'Post-defense revisions submitted by a student',
    dto: SupervisorPostDefenseRevisionSubmited,
  },
  [EmailTemplates.NEW_LOGIN]: {
    subject: 'New login detected',
    dto: NewLoginDto,
  },
  [EmailTemplates.FAILED_LOGIN_ATTEMPT]: {
    subject: 'Failed login attempt',
    dto: NewLoginDto,
  },
  [EmailTemplates.PASSWORD_RESET]: {
    subject: 'Your password was changed',
    dto: PasswordResetDto,
  },
  [EmailTemplates.ACCOUNT_EMAIL_CHANGE]: {
    subject: 'Your email address was changed',
    dto: AccountEmailChangeDto,
  },
  [EmailTemplates.PORTFOLIO_APPROVAL]: {
    subject: 'Portfolio has been approved',
    dto: PortfolioApprovalDto,
  },
  [EmailTemplates.PORTFOLIO_REVISION_REQUIRED]: {
    subject: 'Portfolio improvements required - View details',
    dto: PortfoliRevisionRequiredDto,
  },
  [EmailTemplates.STUDENT_TOPIC_SUBMISSION]: {
    subject: 'Your research topic has been submitted to HoD',
    dto: StudentTopicSubmissionDto,
  },
  [EmailTemplates.STUDENT_HOD_TOPIC_RESPONSE]: {
    subject: 'HoD Has acted on your topic submitted',
    dto: StudentHodTopicResponseDto,
  },
  [EmailTemplates.STUDENT_SUPERVISOR_ASSIGNMENT]: {
    subject: 'HoD Has assigned you a supervisor',
    dto: StudentSupervisorAssignmentDto,
  },
  [EmailTemplates.ACADEMIC_PROJECT_SUPERVISION_MEETING_SCHEDULED]: {
    subject: 'Supervision meeting scheduled',
    dto: AcademicProjectSupervisionMeetingScheduledDto,
  },
  [EmailTemplates.STUDENT_SUPERVISION_MEETING_COMPLETED]: {
    subject: 'Meeting completed - View supervisor notes',
    dto: StudentSupervisionMeetingCompletedDto,
  },
  [EmailTemplates.STUDENT_CONCEPT_PAPER_SUPERVISOR_ACTION]: {
    subject: 'Your concept paper has a new status!',
    dto: StudentConceptPaperSupervisorDto,
  },
  [EmailTemplates.STUDENT_PANEL_REVIEW_SCHEDULED]: {
    subject: 'Defense panel presentation scheduled',
    dto: StudentPanelReviewScheduledDto,
  },
  [EmailTemplates.STUDENT_PROPOSAL_PRESENTATION_FEEDBACK]: {
    subject: 'Panel feedback available for your presentation',
    dto: StudentProposalPresentationFeedbackDto,
  },
  [EmailTemplates.STUDENT_DEFENSE_PRESENTATION_SCHEDULED]: {
    subject: 'Final defense scheduled',
    dto: StudentDefensePresentationScheduledDto,
  },
  [EmailTemplates.STUDENT_DEFENSE_PRESENTATION_FEEDBACK]: {
    subject: 'Final defense feedback available',
    dto: StudentProposalPresentationFeedbackDto,
  },
  [EmailTemplates.STUDENT_EDITOR_DOCUMENT_COMMENT]: {
    subject: 'New review comment',
    dto: StudentEditorDocumentCommentDto,
  },
  [EmailTemplates.PROJECT_COLLABORATION_REQUEST]: {
    subject: 'New collaboration invitation',
    dto: ProjectCollaborationRequestDto,
  },
  [EmailTemplates.PROJECT_COLLABORATION_REPLY]: {
    subject: 'New Collaboration reply',
    dto: ProjectCollaborationReplyDto,
  },
  [EmailTemplates.STUDENT_PROJECT_CHANGES_REQUESTED]: {
    subject: 'Project Review new status',
    dto: StudentProjectPublicationOrRejectionto,
  },
  [EmailTemplates.STUDENT_NEW_PORTFOLIO_RECOMMENDATION]: {
    subject: 'New recommendation',
    dto: StudentRecommendationDto,
  },
  [EmailTemplates.STUDENT_PORTFOLIO_RECOMMENDATION_UPDATE]: {
    subject: 'Recommendation was updated',
    dto: StudentRecommendationDto,
  },
  [EmailTemplates.TWO_FACTOR_AUTH_STATUS_CHANGE]: {
    subject: 'Two-Factor Authentication Status Change',
    dto: TwoFactorAuthStatusChangeDto,
  },
  [EmailTemplates.EMAIL_NOTIFICATIONS_STATUS_CHANGE]: {
    subject: 'Email Notifications Status Change',
    dto: EmailNotificationsStatusChangeDto,
  },
  [EmailTemplates.HOD_TOPIC_SUBMISSION]: {
    subject: 'Research Topic Submitted To You',
    dto: HodTopicSubmissionDto,
  },
  [EmailTemplates.HOD_PROPOSAL_APPROVAL_FROM_SUPERVISOR]: {
    subject: 'Proposal Approval Request From Supervisor',
    dto: HodTopicSubmissionDto,
  },
  [EmailTemplates.EMAIL_TEMPLATE]: {
    subject: 'Email Template',
    dto: BaseEmailDto,
  },

  // Credit Jambo Templates
  [EmailTemplates.CUSTOMER_REGISTRATION]: {
    subject: 'Welcome to Credit Jambo!',
    dto: CustomerRegistrationDto,
  },
  [EmailTemplates.DEPOSIT_SUCCESS]: {
    subject: 'Deposit Successful',
    dto: DepositSuccessDto,
  },
  [EmailTemplates.INTEREST_CREDITED]: {
    subject: 'Monthly Interest Added to Your Account',
    dto: InterestCreditedDto,
  },
  [EmailTemplates.LATE_FEE_APPLIED]: {
    subject: 'Late Fee Applied to Your Loan',
    dto: LateFeeAppliedDto,
  },
  [EmailTemplates.LOAN_APPROVED]: {
    subject: 'Loan Approved',
    dto: LoanApprovedDto,
  },
  [EmailTemplates.LOAN_REJECTED]: {
    subject: 'Loan Application Update',
    dto: LoanRejectedDto,
  },
  [EmailTemplates.LOAN_DEFAULTED]: {
    subject: 'URGENT: Loan Defaulted - Immediate Action Required',
    dto: LoanDefaultedDto,
  },
  [EmailTemplates.LOAN_DISBURSED]: {
    subject: 'Loan Disbursed',
    dto: LoanDisbursedDto,
  },
  [EmailTemplates.PAYMENT_OVERDUE]: {
    subject: 'Payment Overdue - Grace Period Notice',
    dto: PaymentOverdueDto,
  },
  [EmailTemplates.REPAYMENT_DUE]: {
    subject: 'Repayment Due Reminder',
    dto: RepaymentDueDto,
  },
  [EmailTemplates.REPAYMENT_RECEIVED]: {
    subject: 'Repayment Received',
    dto: RepaymentReceivedDto,
  },
  [EmailTemplates.TIER_UPGRADE]: {
    subject: 'Congratulations! Account Tier Upgraded',
    dto: TierUpgradeDto,
  },
  [EmailTemplates.WITHDRAWAL_SUCCESS]: {
    subject: 'Withdrawal Successful',
    dto: WithdrawalSuccessDto,
  },

  // Admin Actions
  [EmailTemplates.CREDIT_LIMIT_UPDATED]: {
    subject: 'Your Credit Limit Has Been Updated',
    dto: CreditLimitUpdatedDto,
  },
  [EmailTemplates.CREDIT_SCORE_UPDATED]: {
    subject: 'Credit Score Update',
    dto: CreditScoreUpdatedDto,
  },
  [EmailTemplates.ACCOUNT_SUSPENDED]: {
    subject: 'Important: Account Suspended',
    dto: AccountSuspendedDto,
  },
  [EmailTemplates.ACCOUNT_UNSUSPENDED]: {
    subject: 'Your Account Has Been Reactivated',
    dto: AccountUnsuspendedDto,
  },
} as const;

export type EmailTemplateDataMap = {
  [K in EmailTemplates]: InstanceType<
    (typeof EMAIL_TEMPLATES_CONFIG)[K]['dto']
  >;
};
