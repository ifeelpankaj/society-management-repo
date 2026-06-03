"use client";

import {
  Building2,
  CheckCircle2,
  DoorOpen,
  Loader2,
  LogIn,
  LogOut,
  Search,
  Send,
  UserPlus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppLoader } from "@/components/shared/app-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type ModelsLoginRequest,
  type ModelsPublicClaimFlatResponse,
  type ModelsSubmitFlatClaimRequest,
  useGetV1AuthProfileQuery,
  useGetV1MeFlatClaimsQuery,
  useGetV1PublicSocietiesBySocietyCodeClaimOptionsQuery,
  usePostV1AuthLoginMutation,
  usePostV1AuthLogoutMutation,
  usePostV1AuthResidentRegisterMutation,
  usePostV1FlatClaimsMutation,
} from "@/lib/api/generated-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import { toIndianPhone } from "@/lib/validations";
import { clearClientSession } from "@/features/auth/logout";
import { useAppDispatch } from "@/store/store";

type ResidentClaimPageProps = {
  societyCode: string;
};

type AuthMode = "login" | "register";
type ResidentRole = "owner" | "tenant" | "family";

const roles: Array<{ value: ResidentRole; label: string }> = [
  { value: "owner", label: "Owner" },
  { value: "tenant", label: "Tenant" },
  { value: "family", label: "Family" },
];

function flatLabel(flat: ModelsPublicClaimFlatResponse) {
  const parts = [flat.block, flat.floor].filter(Boolean);
  return parts.length
    ? `${flat.flat_number} (${parts.join(", ")})`
    : (flat.flat_number ?? "Flat");
}

function statusVariant(status?: ModelsPublicClaimFlatResponse["status"]) {
  if (status === "vacant") {
    return "secondary" as const;
  }
  if (status === "blocked") {
    return "destructive" as const;
  }
  return "outline" as const;
}

export function ResidentClaimPage({ societyCode }: ResidentClaimPageProps) {
  const normalizedCode = decodeURIComponent(societyCode).trim().toUpperCase();
  const [search, setSearch] = useState("");
  const [selectedFlatId, setSelectedFlatId] = useState<number | null>(null);
  const [requestedRole, setRequestedRole] = useState<ResidentRole>("owner");
  const [requestedPrimary, setRequestedPrimary] = useState(true);
  const [note, setNote] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerFirstName, setRegisterFirstName] = useState("");
  const [registerLastName, setRegisterLastName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [submittedClaimId, setSubmittedClaimId] = useState<number | null>(null);
  const dispatch = useAppDispatch();
  const {
    data: claimOptions,
    isError: isClaimOptionsError,
    isLoading: isLoadingClaimOptions,
    refetch: refetchClaimOptions,
  } = useGetV1PublicSocietiesBySocietyCodeClaimOptionsQuery({
    societyCode: normalizedCode,
  });

  const {
    data: profile,
    isFetching: isFetchingProfile,
    refetch: refetchProfile,
  } = useGetV1AuthProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const user = profile?.data?.user ?? null;

  const { data: myClaimsData, refetch: refetchMyClaims } =
    useGetV1MeFlatClaimsQuery(
      {},
      {
        skip: !user,
      },
    );

  const [login, { isLoading: isLoggingIn }] = usePostV1AuthLoginMutation();
  const [registerResident, { isLoading: isRegistering }] =
    usePostV1AuthResidentRegisterMutation();
  const [submitClaim, { isLoading: isSubmittingClaim }] =
    usePostV1FlatClaimsMutation();
  const [logout, { isLoading: isLoggingOut }] = usePostV1AuthLogoutMutation();
  const handleLogout = async () => {
    const toastId = toast.loading("Signing out...");

    try {
      const response = await logout().unwrap();

      setSubmittedClaimId(null);

      await refetchProfile();

      toast.success(getApiMessage(response, "Signed out successfully."), {
        id: toastId,
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not sign out."), {
        id: toastId,
      });
    }
  };
  const society = claimOptions?.data?.society ?? null;
  const flats = claimOptions?.data?.flats ?? [];
  const selectedFlat = flats.find((flat) => flat.id === selectedFlatId) ?? null;
  const availableFlat = selectedFlat?.status === "vacant" ? selectedFlat : null;

  const filteredFlats = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return flats;
    }
    return flats.filter((flat) =>
      [flat.flat_number, flat.block, flat.floor, flat.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [flats, search]);

  const mySocietyClaims = useMemo(() => {
    if (!society?.id) {
      return [];
    }
    return (myClaimsData?.data?.claims ?? []).filter(
      (claim) => claim.society_id === society.id,
    );
  }, [myClaimsData, society]);

  const submittedClaim =
    mySocietyClaims.find((claim) => claim.id === submittedClaimId) ??
    mySocietyClaims.find(
      (claim) => claim.flat_id === selectedFlatId && claim.status === "pending",
    ) ??
    null;

  const handleLogin = async () => {
    const identifier = loginIdentifier.trim();
    if (!identifier || !loginPassword) {
      toast.error("Enter your email or phone and password.");
      return;
    }

    const payload = identifier.includes("@")
      ? { email: identifier.toLowerCase(), password: loginPassword }
      : { phone_number: toIndianPhone(identifier), password: loginPassword };

    const toastId = toast.loading("Signing you in...");
    try {
      const response = await login({
        modelsLoginRequest: payload as ModelsLoginRequest,
      }).unwrap();
      await refetchProfile();
      toast.success(getApiMessage(response, "Welcome back."), {
        id: toastId,
        description: "You can submit your flat claim now.",
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Invalid login credentials."), {
        id: toastId,
      });
    }
  };

  const handleRegister = async () => {
    if (
      !registerFirstName.trim() ||
      !registerEmail.trim() ||
      !registerPhone.trim() ||
      !registerPassword
    ) {
      toast.error("Fill the required registration fields.");
      return;
    }

    const toastId = toast.loading("Creating your resident account...");
    try {
      const response = await registerResident({
        modelsResidentRegisterRequest: {
          first_name: registerFirstName.trim(),
          last_name: registerLastName.trim() || undefined,
          email: registerEmail.trim().toLowerCase(),
          phone_number: toIndianPhone(registerPhone),
          password: registerPassword,
        },
      }).unwrap();
      await refetchProfile();
      toast.success(getApiMessage(response, "Resident account created."), {
        id: toastId,
        description: "No OTP needed. You can submit your claim now.",
      });
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not create resident account."),
        { id: toastId },
      );
    }
  };

  const handleSubmitClaim = async () => {
    if (!society?.id || !availableFlat?.id) {
      toast.error("Select a vacant flat to continue.");
      return;
    }
    if (!user) {
      toast.error("Login or register before submitting the claim.");
      return;
    }

    const toastId = toast.loading("Submitting your flat claim...");
    try {
      const response = await submitClaim({
        modelsSubmitFlatClaimRequest: {
          society_id: society.id,
          flat_id: availableFlat.id,
          requested_role: requestedRole,
          requested_primary: requestedPrimary,
          note: note.trim() || undefined,
        } as ModelsSubmitFlatClaimRequest,
      }).unwrap();
      const claim = response.data?.claim ?? null;
      setSubmittedClaimId(claim?.id ?? null);
      await refetchMyClaims();
      toast.success(getApiMessage(response, "Flat claim submitted."), {
        id: toastId,
        description: "Your society admin will review it.",
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not submit this claim."), {
        id: toastId,
      });
    }
  };

  if (isLoadingClaimOptions) {
    return (
      <AppLoader
        label="Opening claim form"
        description="Finding the society and available flats."
      />
    );
  }

  if (isClaimOptionsError || !society) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <EmptyState
          title="Claim link not found"
          description="This QR code does not match an active society."
          action={
            <Button onClick={() => refetchClaimOptions()} type="button">
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Building2 className="size-4" />
              <span>{society.society_code}</span>
            </div>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-normal">
                {society.name}
              </h1>
              <p className="text-muted-foreground text-sm">
                {[society.city, society.state, society.pincode, society.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
          <Badge variant="outline">{society.total_flats} flats</Badge>
        </section>

        {submittedClaim ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-600" />
                Claim submitted
              </CardTitle>
              <CardDescription>
                Your claim for {submittedClaim.flat_number ?? "this flat"} is
                pending society approval.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 text-sm">
              <Badge variant="secondary">{submittedClaim.status}</Badge>
              <Badge variant="outline">{submittedClaim.requested_role}</Badge>
              {submittedClaim.requested_primary ? (
                <Badge variant="outline">Primary resident</Badge>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card>
            <CardHeader>
              <CardTitle>Select your flat</CardTitle>
              <CardDescription>
                Occupied or blocked flats are shown but cannot be claimed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg border bg-background px-3">
                <Search className="size-4 text-muted-foreground" />
                <Input
                  aria-label="Search flats"
                  className="border-0 px-0 shadow-none focus-visible:ring-0"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search flat, block, floor, or status"
                  value={search}
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {filteredFlats.map((flat) => {
                  const isSelected = selectedFlatId === flat.id;
                  const isVacant = flat.status === "vacant";
                  return (
                    <button
                      className={[
                        "flex min-h-20 items-start justify-between gap-3 rounded-lg border p-3 text-left transition",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "bg-background hover:bg-muted/50",
                        isVacant ? "" : "opacity-70",
                      ].join(" ")}
                      key={flat.id ?? flat.flat_number}
                      onClick={() => {
                        if (flat.id) {
                          setSelectedFlatId(flat.id);
                        }
                      }}
                      type="button"
                    >
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 font-medium">
                          <DoorOpen className="size-4" />
                          {flat.flat_number}
                        </span>
                        <span className="mt-1 block text-muted-foreground text-xs">
                          {[flat.block, flat.floor]
                            .filter(Boolean)
                            .join(", ") || "No block or floor set"}
                        </span>
                      </span>
                      <Badge variant={statusVariant(flat.status)}>
                        {flat.status}
                      </Badge>
                    </button>
                  );
                })}
              </div>

              {filteredFlats.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-center text-muted-foreground text-sm">
                  No flats match your search.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Claim details</CardTitle>
                <CardDescription>
                  {selectedFlat
                    ? `Selected ${flatLabel(selectedFlat)}`
                    : "Choose a flat to continue."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((role) => (
                    <Button
                      key={role.value}
                      onClick={() => setRequestedRole(role.value)}
                      type="button"
                      variant={
                        requestedRole === role.value ? "default" : "outline"
                      }
                    >
                      {role.label}
                    </Button>
                  ))}
                </div>

                <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                  <input
                    checked={requestedPrimary}
                    className="size-4"
                    onChange={(event) =>
                      setRequestedPrimary(event.target.checked)
                    }
                    type="checkbox"
                  />
                  Primary resident for this flat
                </label>

                <label className="block space-y-2 text-sm">
                  <span className="font-medium">Note</span>
                  <textarea
                    className="min-h-24 w-full resize-none rounded-lg border bg-background p-3 outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    maxLength={500}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Add owner/tenant details or documents to verify later"
                    value={note}
                  />
                </label>

                <Button
                  className="w-full"
                  disabled={
                    !availableFlat ||
                    !user ||
                    isSubmittingClaim ||
                    Boolean(submittedClaim)
                  }
                  onClick={handleSubmitClaim}
                  type="button"
                >
                  {isSubmittingClaim ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Send />
                  )}
                  Submit claim
                </Button>

                {selectedFlat && selectedFlat.status !== "vacant" ? (
                  <p className="text-destructive text-sm">
                    This flat is {selectedFlat.status} and cannot receive a new
                    claim.
                  </p>
                ) : null}
              </CardContent>
            </Card>

            {!user ? (
              <Card>
                <CardHeader>
                  <CardTitle>Login or register</CardTitle>
                  <CardDescription>
                    Resident registration starts your session immediately.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => setAuthMode("login")}
                      type="button"
                      variant={authMode === "login" ? "default" : "outline"}
                    >
                      <LogIn />
                      Login
                    </Button>
                    <Button
                      onClick={() => setAuthMode("register")}
                      type="button"
                      variant={authMode === "register" ? "default" : "outline"}
                    >
                      <UserPlus />
                      Register
                    </Button>
                  </div>

                  {authMode === "login" ? (
                    <div className="space-y-3">
                      <Input
                        autoComplete="email"
                        onChange={(event) =>
                          setLoginIdentifier(event.target.value)
                        }
                        placeholder="Email or phone"
                        value={loginIdentifier}
                      />
                      <Input
                        autoComplete="current-password"
                        onChange={(event) =>
                          setLoginPassword(event.target.value)
                        }
                        placeholder="Password"
                        type="password"
                        value={loginPassword}
                      />
                      <Button
                        className="w-full"
                        disabled={isLoggingIn}
                        onClick={handleLogin}
                        type="button"
                      >
                        {isLoggingIn ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <LogIn />
                        )}
                        Login
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          autoComplete="given-name"
                          onChange={(event) =>
                            setRegisterFirstName(event.target.value)
                          }
                          placeholder="First name"
                          value={registerFirstName}
                        />
                        <Input
                          autoComplete="family-name"
                          onChange={(event) =>
                            setRegisterLastName(event.target.value)
                          }
                          placeholder="Last name"
                          value={registerLastName}
                        />
                      </div>
                      <Input
                        autoComplete="email"
                        onChange={(event) =>
                          setRegisterEmail(event.target.value)
                        }
                        placeholder="Email"
                        value={registerEmail}
                      />
                      <Input
                        autoComplete="tel"
                        onChange={(event) =>
                          setRegisterPhone(event.target.value)
                        }
                        placeholder="Phone"
                        value={registerPhone}
                      />
                      <Input
                        autoComplete="new-password"
                        onChange={(event) =>
                          setRegisterPassword(event.target.value)
                        }
                        placeholder="Password"
                        type="password"
                        value={registerPassword}
                      />
                      <Button
                        className="w-full"
                        disabled={isRegistering}
                        onClick={handleRegister}
                        type="button"
                      >
                        {isRegistering ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <UserPlus />
                        )}
                        Register
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Signed in</CardTitle>
                  <CardDescription>
                    {isFetchingProfile
                      ? "Refreshing your session."
                      : (user.full_name ?? user.email ?? "Resident account")}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    type="button"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <LogOut />
                    )}
                    Logout
                  </Button>
                </CardContent>
              </Card>
            )}

            {mySocietyClaims.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>My claims</CardTitle>
                  <CardDescription>
                    Claims you have submitted for this society.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mySocietyClaims.map((claim) => (
                    <div
                      className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
                      key={claim.id}
                    >
                      <span className="min-w-0 truncate">
                        {claim.flat_number ?? `Flat #${claim.flat_id}`}
                      </span>
                      <Badge variant="outline">{claim.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
