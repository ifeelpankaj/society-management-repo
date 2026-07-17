import type { ModelsRegisterRequest } from "@/lib/api/generated-api";

export type GetStartedValues = ModelsRegisterRequest;

export type GetStartedFormValues = GetStartedValues & {
  confirmPassword: string;
};

export type OtpValues = {
  otp: string;
};

export type AccountCreatedSuccessProps = {
  email: string;
};
export type VerifyOtpStepFormProps = {
  email: string;
  isVerifying: boolean;
  isSigningIn: boolean;
  isResending: boolean;
  onSubmit: (values: OtpValues) => void;
  onResend: () => void;
};
export type RegisterStepFormProps = {
  isLoading: boolean;
  onSubmit: (values: GetStartedFormValues) => void;
};
