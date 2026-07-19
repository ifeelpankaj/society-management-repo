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
import { useCallback, useMemo, useState } from "react";
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
import { completeClientSignOut } from "@/features/auth/logout";
import {
  ClaimLoginForm,
  type ClaimLoginFormValues,
  ClaimRegisterForm,
  type ClaimRegisterFormValues,
} from "@/features/resident-claim/components/claim-auth-form";
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
import { buildLoginPayload, toIndianPhone } from "@/lib/validations";
import { useAppDispatch } from "@/store/store";

type ResidentClaimPageProps = {
  societyCode: string;
};

type AuthMode = "login" | "register";
type ResidentRole = "owner" | "tenant" | "family";

const allRoles: Array<{ value: ResidentRole; label: string }> = [
  { value: "owner", label: "Owner" },
  { value: "tenant", label: "Tenant" },
  { value: "family", label: "Family" },
];

const occupiedRoles: Array<{ value: ResidentRole; label: string }> = [
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

function canClaimFlat(flat: ModelsPublicClaimFlatResponse | null) {
  return flat?.status === "vacant" || flat?.status === "occupied";
}

function resolvePrimaryForSubmit(
  role: ResidentRole,
  flat: ModelsPublicClaimFlatResponse | null,
  requestedPrimary: boolean,
) {
  if (flat?.status === "occupied" || role === "family") {
    return false;
  }
  return requestedPrimary;
}

export function ResidentClaimPage({ societyCode }: ResidentClaimPageProps) {
  const normalizedCode = decodeURIComponent(societyCode).trim().toUpperCase();
  const [search, setSearch] = useState("");
  const [selectedFlatId, setSelectedFlatId] = useState<number | null>(null);
  const [requestedRole, setRequestedRole] = useState<ResidentRole>("owner");
  const [requestedPrimary, setRequestedPrimary] = useState(true);
  const [note, setNote] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
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

  const society = claimOptions?.data?.society ?? null;
  const flats = claimOptions?.data?.flats ?? [];
  const selectedFlat = flats.find((flat) => flat.id === selectedFlatId) ?? null;
  const isOccupiedFlat = selectedFlat?.status === "occupied";
  const isBlockedFlat = selectedFlat?.status === "blocked";
  const claimableFlat = canClaimFlat(selectedFlat) ? selectedFlat : null;
  const roleOptions = isOccupiedFlat ? occupiedRoles : allRoles;
  const primaryAllowed =
    requestedRole !== "family" && selectedFlat?.status === "vacant";

  const handleRoleChange = useCallback((role: ResidentRole) => {
    setRequestedRole(role);
    if (role === "family") {
      setRequestedPrimary(false);
    }
  }, []);

  const handleFlatSelect = useCallback(
    (flat: ModelsPublicClaimFlatResponse) => {
      if (!flat.id) {
        return;
      }
      setSelectedFlatId(flat.id);
      if (flat.status === "occupied") {
        setRequestedRole((current) =>
          current === "owner" ? "tenant" : current,
        );
        setRequestedPrimary(false);
      }
    },
    [],
  );

  const handleLogout = async () => {
    const toastId = toast.loading("Signing out...");

    try {
      const response = await logout().unwrap();
      await completeClientSignOut(dispatch);
      setSubmittedClaimId(null);
      toast.success(getApiMessage(response, "Signed out successfully."), {
        id: toastId,
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not sign out."), {
        id: toastId,
      });
    }
  };

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

  const handleLogin = async (values: ClaimLoginFormValues) => {
    const toastId = toast.loading("Signing you in...");
    try {
      const response = await login({
        modelsLoginRequest: buildLoginPayload(
          values.identifier,
          values.password,
        ) as ModelsLoginRequest,
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

  const handleRegister = async (values: ClaimRegisterFormValues) => {
    const toastId = toast.loading("Creating your resident account...");
    try {
      const response = await registerResident({
        modelsResidentRegisterRequest: {
          first_name: values.first_name.trim(),
          last_name: values.last_name.trim() || undefined,
          email: values.email.trim().toLowerCase(),
          phone_number: toIndianPhone(values.phone_number),
          password: values.password,
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
    if (!society?.id || !claimableFlat?.id) {
      toast.error("Select a vacant or occupied flat to continue.");
      return;
    }
    if (!user) {
      toast.error("Login or register before submitting the claim.");
      return;
    }
    if (isOccupiedFlat && requestedRole === "owner") {
      toast.error("Occupied flats accept tenant or family claims only.");
      return;
    }

    const toastId = toast.loading("Submitting your flat claim...");
    try {
      const response = await submitClaim({
        modelsSubmitFlatClaimRequest: {
          society_id: society.id,
          flat_id: claimableFlat.id,
          requested_role: requestedRole,
          requested_primary: resolvePrimaryForSubmit(
            requestedRole,
            claimableFlat,
            requestedPrimary,
          ),
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
                Vacant flats accept any role. Occupied flats accept tenant or
                family claims only. Blocked flats cannot be claimed.
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
                  const isBlocked = flat.status === "blocked";
                  return (
                    <button
                      className={[
                        "flex min-h-20 items-start justify-between gap-3 rounded-lg border p-3 text-left transition",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "bg-background hover:bg-muted/50",
                        isBlocked ? "opacity-70" : "",
                      ].join(" ")}
                      key={flat.id ?? flat.flat_number}
                      onClick={() => handleFlatSelect(flat)}
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
                <div
                  className={`grid gap-2 ${roleOptions.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}
                >
                  {roleOptions.map((role) => (
                    <Button
                      key={role.value}
                      onClick={() => handleRoleChange(role.value)}
                      type="button"
                      variant={
                        requestedRole === role.value ? "default" : "outline"
                      }
                    >
                      {role.label}
                    </Button>
                  ))}
                </div>

                <label
                  className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${primaryAllowed ? "" : "opacity-60"}`}
                >
                  <input
                    checked={primaryAllowed ? requestedPrimary : false}
                    className="size-4"
                    disabled={!primaryAllowed}
                    onChange={(event) =>
                      setRequestedPrimary(event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span>
                    Primary resident for this flat
                    {!primaryAllowed ? (
                      <span className="mt-0.5 block text-muted-foreground text-xs">
                        {requestedRole === "family"
                          ? "Family members cannot be primary residents."
                          : isOccupiedFlat
                            ? "Occupied flats cannot receive a new primary resident."
                            : "Primary is available for owner or tenant on vacant flats."}
                      </span>
                    ) : null}
                  </span>
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
                    !claimableFlat ||
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

                {isBlockedFlat ? (
                  <p className="text-destructive text-sm">
                    This flat is blocked and cannot receive a new claim.
                  </p>
                ) : null}
                {isOccupiedFlat ? (
                  <p className="text-muted-foreground text-sm">
                    This flat is occupied. You can claim as tenant or family
                    only.
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
                    <ClaimLoginForm
                      isLoading={isLoggingIn}
                      onSubmit={handleLogin}
                    />
                  ) : (
                    <ClaimRegisterForm
                      isLoading={isRegistering}
                      onSubmit={handleRegister}
                    />
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
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                    type="button"
                    variant="outline"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <LogOut />
                    )}
                    Sign out
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
