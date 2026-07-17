export type ForgotStep = "email" | "reset" | "done";

export type EmailValues = {
  email: string;
};

export type ResetValues = {
  otp: string;
  new_password: string;
  confirm_password: string;
};
export type EmailStepFormProps = {
  isLoading: boolean;
  onSubmit: (values: EmailValues) => void;
};
export type ResetStepFormProps = {
  email: string;
  isResetting: boolean;
  isResending: boolean;
  onSubmit: (values: ResetValues) => void;
  onResend: () => void;
};
