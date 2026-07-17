"use client";

import {
  Building2,
  Hash,
  Layers,
  Mail,
  MapPin,
  Phone,
  Plus,
} from "lucide-react";
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
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { WorkspacePage } from "@/components/shared/workspace-page";
import { Button } from "@/components/ui/button";
import { RouteGuard } from "@/features/auth/components/route-guard";
import {
  type ModelsCreateSocietyRequest,
  usePostV1SocietiesMutation,
} from "@/lib/api/generated-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import { getErrorText } from "@/lib/form/form-error";
import {
  getEmailError,
  getPhoneError,
  normalizePinCode,
} from "@/lib/validations";

type CreateSocietyFormValues = {
  name: string;
  society_code: string;
  email: string;
  phone_number: string;
  address_line1: string;
  address_line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  total_blocks: string;
  total_flats: string;
};

const defaultValues: CreateSocietyFormValues = {
  name: "",
  society_code: "",
  email: "",
  phone_number: "",
  address_line1: "",
  address_line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  total_blocks: "0",
  total_flats: "0",
};

function optionalString(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function optionalUpperString(value: string) {
  return optionalString(value)?.toUpperCase();
}

function optionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return Number(trimmed);
}

function buildCreateSocietyPayload(
  values: CreateSocietyFormValues,
): ModelsCreateSocietyRequest {
  return {
    name: values.name.trim(),
    society_code: optionalUpperString(values.society_code),
    email: optionalString(values.email)?.toLowerCase(),
    phone_number: optionalString(values.phone_number),
    address_line1: optionalString(values.address_line1),
    address_line2: optionalString(values.address_line2),
    landmark: optionalString(values.landmark),
    city: optionalString(values.city),
    state: optionalString(values.state),
    pincode: optionalString(values.pincode),
    country: optionalString(values.country),
    total_blocks: optionalNumber(values.total_blocks),
    total_flats: optionalNumber(values.total_flats),
  };
}

function nonNegativeIntegerRule(label: string) {
  return {
    validate: (value: string) => {
      if (!value.trim()) return true;

      const numericValue = Number(value);
      if (!Number.isInteger(numericValue) || numericValue < 0) {
        return `${label} must be a non-negative whole number`;
      }

      return true;
    },
  };
}

function getRequiredLengthValidity(value: string, min: number, max: number) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length >= min && trimmed.length <= max;
}

function getOptionalMaxLengthValidity(value: string, max: number) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length <= max;
}

function getOptionalEmailValidity(value: string) {
  return value.trim() ? getEmailError(value) === null : null;
}

function getOptionalPhoneValidity(value: string) {
  return value.trim() ? getPhoneError(value) === null : null;
}

function getOptionalPincodeValidity(value: string) {
  return value.trim() ? normalizePinCode(value).length === 6 : null;
}

function getOptionalNonNegativeIntegerValidity(value: string) {
  if (!value.trim()) return null;

  const numericValue = Number(value);
  return Number.isInteger(numericValue) && numericValue >= 0;
}

function CreateSocietyFields({
  form,
}: {
  form: UseFormReturn<CreateSocietyFormValues>;
}) {
  const { errors } = useFormState({ control: form.control });
  const [
    name,
    societyCode,
    email,
    phoneNumber,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    pincode,
    country,
    totalBlocks,
    totalFlats,
  ] = useWatch({
    control: form.control,
    name: [
      "name",
      "society_code",
      "email",
      "phone_number",
      "address_line1",
      "address_line2",
      "landmark",
      "city",
      "state",
      "pincode",
      "country",
      "total_blocks",
      "total_flats",
    ],
  });

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          autoComplete="organization"
          error={getErrorText(errors.name)}
          icon={<Building2 className="size-4" />}
          id="society-name"
          label="Society name"
          placeholder="Green Heights"
          valid={getRequiredLengthValidity(name, 2, 200)}
          {...form.register("name", {
            required: "Enter your society name",
            minLength: {
              value: 2,
              message: "Use at least 2 characters",
            },
            maxLength: {
              value: 200,
              message: "Use at most 200 characters",
            },
          })}
        />

        <FormField
          autoComplete="off"
          error={getErrorText(errors.society_code)}
          hint="Optional. Leave blank to let the system generate it."
          icon={<Hash className="size-4" />}
          id="society-code"
          label="Society code"
          placeholder="GREENHEIGHTS"
          valid={getOptionalMaxLengthValidity(societyCode, 50)}
          {...form.register("society_code", {
            maxLength: {
              value: 50,
              message: "Use at most 50 characters",
            },
          })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          autoComplete="email"
          error={getErrorText(errors.email)}
          icon={<Mail className="size-4" />}
          id="society-email"
          label="Email"
          placeholder="office@society.com"
          type="email"
          valid={getOptionalEmailValidity(email)}
          {...form.register("email", {
            validate: (value) =>
              value.trim() ? (getEmailError(value) ?? true) : true,
          })}
        />

        <FormField
          autoComplete="tel"
          error={getErrorText(errors.phone_number)}
          hint="Optional 10-digit Indian mobile number."
          icon={<Phone className="size-4" />}
          id="society-phone"
          label="Phone number"
          placeholder="9876543210"
          valid={getOptionalPhoneValidity(phoneNumber)}
          {...form.register("phone_number", {
            validate: (value) =>
              value.trim() ? (getPhoneError(value) ?? true) : true,
          })}
        />
      </div>

      <FormField
        autoComplete="street-address"
        error={getErrorText(errors.address_line1)}
        icon={<MapPin className="size-4" />}
        id="address-line1"
        label="Address line 1"
        placeholder="Main road, sector 4"
        valid={getOptionalMaxLengthValidity(addressLine1, 255)}
        {...form.register("address_line1", {
          maxLength: {
            value: 255,
            message: "Use at most 255 characters",
          },
        })}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          autoComplete="address-line2"
          error={getErrorText(errors.address_line2)}
          id="address-line2"
          label="Address line 2"
          placeholder="Near metro station"
          valid={getOptionalMaxLengthValidity(addressLine2, 255)}
          {...form.register("address_line2", {
            maxLength: {
              value: 255,
              message: "Use at most 255 characters",
            },
          })}
        />

        <FormField
          autoComplete="off"
          error={getErrorText(errors.landmark)}
          id="landmark"
          label="Landmark"
          placeholder="Opposite city park"
          valid={getOptionalMaxLengthValidity(landmark, 255)}
          {...form.register("landmark", {
            maxLength: {
              value: 255,
              message: "Use at most 255 characters",
            },
          })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          autoComplete="address-level2"
          error={getErrorText(errors.city)}
          id="city"
          label="City"
          placeholder="Mumbai"
          valid={getOptionalMaxLengthValidity(city, 100)}
          {...form.register("city", {
            maxLength: {
              value: 100,
              message: "Use at most 100 characters",
            },
          })}
        />

        <FormField
          autoComplete="address-level1"
          error={getErrorText(errors.state)}
          id="state"
          label="State"
          placeholder="Maharashtra"
          valid={getOptionalMaxLengthValidity(state, 100)}
          {...form.register("state", {
            maxLength: {
              value: 100,
              message: "Use at most 100 characters",
            },
          })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          autoComplete="postal-code"
          error={getErrorText(errors.pincode)}
          id="pincode"
          label="PIN code"
          placeholder="400001"
          valid={getOptionalPincodeValidity(pincode)}
          {...form.register("pincode", {
            validate: (value) =>
              value.trim()
                ? normalizePinCode(value).length === 6 ||
                  "PIN must be exactly 6 digits"
                : true,
          })}
        />

        <FormField
          autoComplete="country-name"
          error={getErrorText(errors.country)}
          id="country"
          label="Country"
          placeholder="India"
          valid={getOptionalMaxLengthValidity(country, 100)}
          {...form.register("country", {
            maxLength: {
              value: 100,
              message: "Use at most 100 characters",
            },
          })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          error={getErrorText(errors.total_blocks)}
          icon={<Layers className="size-4" />}
          id="total-blocks"
          label="Total blocks"
          min={0}
          placeholder="0"
          type="number"
          valid={getOptionalNonNegativeIntegerValidity(totalBlocks)}
          {...form.register(
            "total_blocks",
            nonNegativeIntegerRule("Total blocks"),
          )}
        />

        <FormField
          error={getErrorText(errors.total_flats)}
          icon={<Layers className="size-4" />}
          id="total-flats"
          label="Total flats"
          min={0}
          placeholder="0"
          type="number"
          valid={getOptionalNonNegativeIntegerValidity(totalFlats)}
          {...form.register(
            "total_flats",
            nonNegativeIntegerRule("Total flats"),
          )}
        />
      </div>
    </>
  );
}

export function CreateSocietyOnboardingClient() {
  const router = useRouter();
  const [createSociety, { isLoading }] = usePostV1SocietiesMutation();

  const submitSociety: SubmitHandler<CreateSocietyFormValues> = async (
    values,
  ) => {
    const toastId = toast.loading("Creating society...");

    try {
      const response = await createSociety({
        modelsCreateSocietyRequest: buildCreateSocietyPayload(values),
      }).unwrap();

      toast.success(getApiMessage(response, "Society request created."), {
        id: toastId,
        description: "Your society is in verification stage.",
      });
      router.replace("/select-society");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not create society right now."),
        { id: toastId },
      );
    }
  };

  return (
    <RouteGuard mode="authenticated">
      <WorkspacePage className="min-h-screen py-10" size="wizard">
        <PageHeader
          description="Create a society request. Once it is active, you can open it from the society selector."
          eyebrow="Setup required"
          title="Complete society onboarding"
        />

        <SectionCard
          description="Enter the details your team will use to identify this workspace."
          title="Create society"
        >
          <SmartForm<CreateSocietyFormValues>
            defaultValues={defaultValues}
            formOptions={{ mode: "onChange" }}
            onSubmit={submitSociety}
            actions={
              <Button disabled={isLoading} type="submit">
                {isLoading ? "Creating..." : "Create society"}
                <Plus className="size-4" />
              </Button>
            }
          >
            {(form) => <CreateSocietyFields form={form} />}
          </SmartForm>
        </SectionCard>
      </WorkspacePage>
    </RouteGuard>
  );
}
