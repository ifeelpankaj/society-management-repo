"use client";

import {
  Building2,
  CheckCircle2,
  Home,
  Loader2,
  Lock,
  Mail,
  Phone,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type SubmitHandler,
  type UseFormReturn,
  useFormState,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";

import { FormField } from "@/components/forms/form-field";
import { SmartForm } from "@/components/forms/smart-form";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageShell } from "@/components/shared/page-shell";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { isAdminSetupRole } from "@/features/auth/auth-routing";
import { RouteGuard } from "@/features/auth/components/route-guard";
import {
  type ModelsCreateFlatRequest,
  useGetV1SocietiesMyQuery,
  usePostV1SocietiesBySocietyIdFlatsMutation,
} from "@/lib/api/generated-api";
import { useGetV1SocietiesBySocietyIdDashboardBootstrapQuery } from "@/lib/api/society-dashboard-api";
import {
  useGetV1SocietiesBySocietyIdOnboardingBootstrapQuery,
  usePostV1SocietiesBySocietyIdGuardsMutation,
} from "@/lib/api/society-onboarding-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import { getErrorText } from "@/lib/form/form-error";
import { paths } from "@/lib/routes/paths";
import { getEmailError, getPhoneError } from "@/lib/validations";

type SocietyOnboardingClientProps = {
  societyId: number;
};

type FlatFormValues = {
  flat_number: string;
  block: string;
  floor: string;
};

type GuardFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
};

const flatDefaults: FlatFormValues = {
  flat_number: "",
  block: "",
  floor: "",
};

const guardDefaults: GuardFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  password: "",
};

function optionalString(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function requiredLength(value: string, min = 2) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length >= min;
}

function optionalMaxLength(value: string, max: number) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length <= max;
}

function emailValidity(value: string) {
  return value.trim() ? getEmailError(value) === null : null;
}

function phoneValidity(value: string) {
  return value.trim() ? getPhoneError(value) === null : null;
}

function passwordValidity(value: string) {
  return value.trim() ? value.length >= 8 && value.length <= 72 : null;
}

function buildFlatPayload(values: FlatFormValues): ModelsCreateFlatRequest {
  return {
    flat_number: values.flat_number.trim(),
    block: optionalString(values.block),
    floor: optionalString(values.floor),
  };
}

function normalizeGuardPhone(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) return trimmed;
  return `+91${trimmed.replace(/\D/g, "")}`;
}

function FlatFields({ form }: { form: UseFormReturn<FlatFormValues> }) {
  const { errors } = useFormState({ control: form.control });
  const [flatNumber, block, floor] = useWatch({
    control: form.control,
    name: ["flat_number", "block", "floor"],
  });

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <FormField
        error={getErrorText(errors.flat_number)}
        icon={<Home className="size-4" />}
        id="flat-number"
        label="Flat number"
        placeholder="A-101"
        valid={requiredLength(flatNumber, 1)}
        {...form.register("flat_number", {
          required: "Enter a flat number",
          maxLength: { value: 50, message: "Use at most 50 characters" },
        })}
      />
      <FormField
        error={getErrorText(errors.block)}
        icon={<Building2 className="size-4" />}
        id="flat-block"
        label="Block"
        placeholder="A"
        valid={optionalMaxLength(block, 50)}
        {...form.register("block", {
          maxLength: { value: 50, message: "Use at most 50 characters" },
        })}
      />
      <FormField
        error={getErrorText(errors.floor)}
        id="flat-floor"
        label="Floor"
        placeholder="1"
        valid={optionalMaxLength(floor, 50)}
        {...form.register("floor", {
          maxLength: { value: 50, message: "Use at most 50 characters" },
        })}
      />
    </div>
  );
}

function GuardFields({ form }: { form: UseFormReturn<GuardFormValues> }) {
  const { errors } = useFormState({ control: form.control });
  const [firstName, lastName, email, phoneNumber, password] = useWatch({
    control: form.control,
    name: ["first_name", "last_name", "email", "phone_number", "password"],
  });

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          autoComplete="given-name"
          error={getErrorText(errors.first_name)}
          icon={<User className="size-4" />}
          id="guard-first-name"
          label="First name"
          placeholder="Amit"
          valid={requiredLength(firstName)}
          {...form.register("first_name", {
            required: "Enter first name",
            minLength: { value: 2, message: "Use at least 2 characters" },
            maxLength: { value: 100, message: "Use at most 100 characters" },
          })}
        />
        <FormField
          autoComplete="family-name"
          error={getErrorText(errors.last_name)}
          id="guard-last-name"
          label="Last name"
          placeholder="Sharma"
          valid={optionalMaxLength(lastName, 100)}
          {...form.register("last_name", {
            maxLength: { value: 100, message: "Use at most 100 characters" },
          })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          autoComplete="email"
          error={getErrorText(errors.email)}
          icon={<Mail className="size-4" />}
          id="guard-email"
          label="Email"
          placeholder="guard@example.com"
          type="email"
          valid={emailValidity(email)}
          {...form.register("email", {
            required: "Enter email",
            validate: (value) => getEmailError(value) ?? true,
          })}
        />
        <FormField
          autoComplete="tel"
          error={getErrorText(errors.phone_number)}
          icon={<Phone className="size-4" />}
          id="guard-phone"
          label="Phone number"
          placeholder="9876543210"
          valid={phoneValidity(phoneNumber)}
          {...form.register("phone_number", {
            required: "Enter phone number",
            validate: (value) => getPhoneError(value) ?? true,
          })}
        />
      </div>
      <FormField
        autoComplete="new-password"
        error={getErrorText(errors.password)}
        icon={<Lock className="size-4" />}
        id="guard-password"
        label="Password"
        placeholder="Create a password"
        type="password"
        valid={passwordValidity(password)}
        {...form.register("password", {
          required: "Enter password",
          minLength: { value: 8, message: "Use at least 8 characters" },
          maxLength: { value: 72, message: "Use at most 72 characters" },
        })}
      />
    </>
  );
}

function SocietyOnboardingContent({ societyId }: SocietyOnboardingClientProps) {
  const router = useRouter();
  const dashboardPath = societyId
    ? paths.dashboard(societyId)
    : paths.selectSociety();
  const [createFlat, { isLoading: isCreatingFlat }] =
    usePostV1SocietiesBySocietyIdFlatsMutation();
  const [createGuard, { isLoading: isCreatingGuard }] =
    usePostV1SocietiesBySocietyIdGuardsMutation();
  const {
    data: mySocietiesData,
    isFetching: isFetchingMemberships,
    isLoading: isLoadingMemberships,
  } = useGetV1SocietiesMyQuery();
  const memberships = mySocietiesData?.data?.societies ?? [];
  const membership = memberships.find(
    (item) => (item.society?.id ?? item.member?.society_id) === societyId,
  );
  const society = membership?.society;
  const hasSetupAccess =
    membership?.member?.status === "active" &&
    isAdminSetupRole(membership.member.role);
  const isPendingSociety = society?.status === "pending";
  const isActiveSetupSociety = hasSetupAccess && society?.status === "active";
  const {
    data: dashboardData,
    isFetching: isFetchingDashboard,
    isLoading: isLoadingDashboard,
  } = useGetV1SocietiesBySocietyIdDashboardBootstrapQuery(
    { societyId },
    { skip: !isActiveSetupSociety },
  );
  const subscription = dashboardData?.data?.dashboard?.current_subscription;
  const hasActiveSubscription =
    subscription?.status === "active" || subscription?.status === "trial";
  const { data, isFetching, isLoading, refetch } =
    useGetV1SocietiesBySocietyIdOnboardingBootstrapQuery(
      { societyId: societyId ?? 0 },
      { skip: !hasActiveSubscription },
    );
  const onboarding = data?.data?.onboarding;
  const missingSteps = new Set(onboarding?.missing_steps ?? []);

  const submitFlat: SubmitHandler<FlatFormValues> = async (values) => {
    if (!societyId) return;
    const toastId = toast.loading("Creating flat...");

    try {
      const response = await createFlat({
        societyId,
        modelsCreateFlatRequest: buildFlatPayload(values),
      }).unwrap();
      toast.success(getApiMessage(response, "Flat created."), { id: toastId });
      await refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create flat."), {
        id: toastId,
      });
    }
  };

  const submitGuard: SubmitHandler<GuardFormValues> = async (values) => {
    if (!societyId) return;
    const toastId = toast.loading("Creating guard...");

    try {
      const response = await createGuard({
        societyId,
        createGuardRequest: {
          first_name: values.first_name.trim(),
          last_name: optionalString(values.last_name),
          email: values.email.trim().toLowerCase(),
          phone_number: normalizeGuardPhone(values.phone_number),
          password: values.password,
        },
      }).unwrap();
      toast.success(getApiMessage(response, "Guard created."), {
        id: toastId,
      });
      await refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create guard."), {
        id: toastId,
      });
    }
  };

  if (isLoadingMemberships || isFetchingMemberships) {
    return (
      <PageShell background="tinted" className="min-h-screen py-10">
        <main className="mx-auto flex w-full max-w-4xl items-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Checking society access...
        </main>
      </PageShell>
    );
  }

  if (!membership || !hasSetupAccess) {
    return (
      <PageShell background="tinted" className="min-h-screen py-10">
        <main className="mx-auto w-full max-w-4xl">
          <EmptyState
            title="Society is not ready"
            description="Open onboarding from an owner or admin account once this society is active."
            action={
              <Button asChild>
                <Link href="/select-society">Back to societies</Link>
              </Button>
            }
          />
        </main>
      </PageShell>
    );
  }

  if (isPendingSociety) {
    return (
      <PageShell background="tinted" className="min-h-screen py-10">
        <main className="mx-auto w-full max-w-4xl">
          <EmptyState
            title="Society is in verification stage"
            description="Your society request is being reviewed. Onboarding will open once it is approved."
            action={
              <Button asChild>
                <Link href="/select-society">Back to societies</Link>
              </Button>
            }
          />
        </main>
      </PageShell>
    );
  }

  if (isLoadingDashboard || isFetchingDashboard) {
    return (
      <PageShell background="tinted" className="min-h-screen py-10">
        <main className="mx-auto flex w-full max-w-4xl items-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Checking subscription...
        </main>
      </PageShell>
    );
  }

  if (!hasActiveSubscription) {
    return (
      <PageShell background="tinted" className="min-h-screen py-10">
        <main className="mx-auto w-full max-w-4xl">
          <EmptyState
            title="We are finding the best subscription plan for your society"
            description="Onboarding will open once a subscription is assigned and activated."
            action={
              <Button asChild>
                <Link href="/select-society">Back to societies</Link>
              </Button>
            }
          />
        </main>
      </PageShell>
    );
  }

  if (isLoading) {
    return (
      <PageShell background="tinted" className="min-h-screen py-10">
        <main className="mx-auto flex w-full max-w-4xl items-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Loading onboarding...
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell background="tinted" className="min-h-screen py-10">
      <main className="mx-auto w-full max-w-4xl space-y-6">
        <PageHeader
          actions={
            <Button asChild variant="outline">
              <Link href="/select-society">Switch society</Link>
            </Button>
          }
          description="Add the required flats and guard staff before opening the dashboard."
          eyebrow="Society onboarding"
          title={onboarding?.society?.name ?? "Complete setup"}
        />

        {onboarding?.is_onboarded ? (
          <EmptyState
            title="Onboarding complete"
            description="This society has active flats and staff."
            action={
              <Button onClick={() => router.replace(dashboardPath)}>
                Open dashboard
                <CheckCircle2 className="size-4" />
              </Button>
            }
          />
        ) : null}

        {missingSteps.has("flats") ? (
          <SectionCard
            description="Add at least one active flat to start the society workspace."
            title="Create first flat"
          >
            <SmartForm<FlatFormValues>
              defaultValues={flatDefaults}
              formOptions={{ mode: "onChange" }}
              onSubmit={submitFlat}
              actions={
                <Button disabled={isCreatingFlat || isFetching} type="submit">
                  {isCreatingFlat ? "Creating..." : "Create flat"}
                  <Home className="size-4" />
                </Button>
              }
            >
              {(form) => <FlatFields form={form} />}
            </SmartForm>
          </SectionCard>
        ) : null}

        {missingSteps.has("staff") ? (
          <SectionCard
            description="Create one active staff account for gate operations."
            title="Create guard"
          >
            <SmartForm<GuardFormValues>
              defaultValues={guardDefaults}
              formOptions={{ mode: "onChange" }}
              onSubmit={submitGuard}
              actions={
                <Button disabled={isCreatingGuard || isFetching} type="submit">
                  {isCreatingGuard ? "Creating..." : "Create guard"}
                  <Shield className="size-4" />
                </Button>
              }
            >
              {(form) => <GuardFields form={form} />}
            </SmartForm>
          </SectionCard>
        ) : null}
      </main>
    </PageShell>
  );
}

export function SocietyOnboardingClient({
  societyId,
}: SocietyOnboardingClientProps) {
  return (
    <RouteGuard mode="authenticated">
      <SocietyOnboardingContent societyId={societyId} />
    </RouteGuard>
  );
}
