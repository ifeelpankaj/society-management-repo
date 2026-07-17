"use client";

import { useLoginFlow } from "../hooks/use-login-flow";
import { LoginForm } from "./login-form";

export function LoginCard() {
  const { loginUser, isLoading } = useLoginFlow();

  return (
    <div className="w-full rounded-none">
      <LoginForm isLoading={isLoading} onSubmit={loginUser} />
    </div>
  );
}
