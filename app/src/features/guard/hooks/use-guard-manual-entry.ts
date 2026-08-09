import { useCallback, useMemo, useState } from "react";

import { getApiMessage } from "@/features/auth/api-error";
import {
  type ModelsFlatResponse,
  type ModelsVisitorEntry,
  type ModelsVisitorPurpose,
  type ModelsVisitorVehicleType,
  usePostV1SocietiesBySocietyIdVisitorEntriesGuardMutation,
} from "@/lib/api/generated-api";

export type SelectedFlat = {
  id: number;
  block?: string;
  flat_number?: string;
  floor?: string;
};

export type CompanionDetail = {
  name: string;
  phoneNumber: string;
};

export type CompanionFieldErrors = {
  name?: string;
  phoneNumber?: string;
};

export type ManualEntryFormErrors = {
  fullName?: string;
  phoneNumber?: string;
  flat?: string;
  companionsCount?: string;
  companionDetails?: CompanionFieldErrors[];
  deliveryPartner?: string;
  serviceProvider?: string;
  vehicleNumber?: string;
  vehicleType?: string;
};

type CreatedEntryState = {
  entry?: ModelsVisitorEntry;
  qrToken?: string;
};

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function isValidPhone(value: string) {
  const digits = normalizePhone(value);
  return digits.length >= 10 && digits.length <= 15;
}

function requiresPhone(purpose: ModelsVisitorPurpose) {
  return purpose !== "cab";
}

function requiresName(purpose: ModelsVisitorPurpose) {
  return purpose !== "delivery";
}

function isStaffPurpose(purpose: ModelsVisitorPurpose) {
  return purpose === "staff";
}

function emptyCompanion(): CompanionDetail {
  return { name: "", phoneNumber: "" };
}

function resizeCompanions(current: CompanionDetail[], count: number) {
  if (count <= 0) {
    return [];
  }
  if (current.length === count) {
    return current;
  }
  if (current.length < count) {
    return [
      ...current,
      ...Array.from({ length: count - current.length }, emptyCompanion),
    ];
  }
  return current.slice(0, count);
}

function validateCompanionDetails(
  companions: CompanionDetail[],
  count: number,
): CompanionFieldErrors[] {
  const errors: CompanionFieldErrors[] = [];

  for (let index = 0; index < count; index += 1) {
    const companion = companions[index] ?? emptyCompanion();
    const name = companion.name.trim();
    const phone = companion.phoneNumber.trim();
    const fieldErrors: CompanionFieldErrors = {};

    if (!name && !phone) {
      fieldErrors.name = "Enter name or phone";
      fieldErrors.phoneNumber = "Enter name or phone";
    } else if (phone && !isValidPhone(phone)) {
      fieldErrors.phoneNumber = "Enter a valid 10-digit phone number";
    }

    if (fieldErrors.name || fieldErrors.phoneNumber) {
      errors[index] = fieldErrors;
    }
  }

  return errors;
}

function hasCompanionDetailErrors(errors: CompanionFieldErrors[]) {
  return errors.some((entry) => Boolean(entry?.name || entry?.phoneNumber));
}

export function flatFromResponse(flat: ModelsFlatResponse): SelectedFlat | null {
  if (typeof flat.id !== "number" || flat.id <= 0) {
    return null;
  }

  return {
    id: flat.id,
    block: flat.block,
    flat_number: flat.flat_number,
    floor: flat.floor,
  };
}

export function formatSelectedFlatLabel(flat?: SelectedFlat | null) {
  if (!flat) {
    return "";
  }

  const parts = [
    flat.block ? `Block ${flat.block}` : null,
    flat.flat_number ? `Flat ${flat.flat_number}` : null,
  ].filter(Boolean);

  return parts.join(" · ") || `Flat #${flat.id}`;
}

export function useGuardManualEntry(societyId: number) {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [selectedFlat, setSelectedFlat] = useState<SelectedFlat | null>(null);
  const [purpose, setPurpose] = useState<ModelsVisitorPurpose>("guest");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<ModelsVisitorVehicleType | "">("");
  const [deliveryPartner, setDeliveryPartner] = useState("");
  const [deliveryPartnerIsOther, setDeliveryPartnerIsOther] = useState(false);
  const [serviceProvider, setServiceProvider] = useState("");
  const [companionsCount, setCompanionsCountState] = useState(0);
  const [companions, setCompanions] = useState<CompanionDetail[]>([]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<ManualEntryFormErrors>({});
  const [createdEntry, setCreatedEntry] = useState<CreatedEntryState>();

  const [createEntry, createEntryState] = usePostV1SocietiesBySocietyIdVisitorEntriesGuardMutation();

  const optionalFieldsCount = useMemo(() => {
    let count = 0;
    if (email.trim()) count += 1;
    if (vehicleNumber.trim()) count += 1;
    if (vehicleType) count += 1;
    if (notes.trim()) count += 1;
    return count;
  }, [email, notes, vehicleNumber, vehicleType]);

  const validate = useCallback((): ManualEntryFormErrors => {
    const nextErrors: ManualEntryFormErrors = {};

    if (requiresName(purpose) && !fullName.trim()) {
      nextErrors.fullName = "Visitor name is required";
    }

    if (requiresPhone(purpose)) {
      if (!phoneNumber.trim()) {
        nextErrors.phoneNumber = "Phone number is required";
      } else if (!isValidPhone(phoneNumber)) {
        nextErrors.phoneNumber = "Enter a valid 10-digit phone number";
      }
    } else if (phoneNumber.trim() && !isValidPhone(phoneNumber)) {
      nextErrors.phoneNumber = "Enter a valid 10-digit phone number";
    }

    if (!isStaffPurpose(purpose) && !selectedFlat?.id) {
      nextErrors.flat = "Select a visiting flat";
    }

    if (purpose === "guest" && companionsCount < 0) {
      nextErrors.companionsCount = "Companions cannot be negative";
    }

    if (purpose === "guest" && companionsCount > 0) {
      const companionErrors = validateCompanionDetails(companions, companionsCount);
      if (hasCompanionDetailErrors(companionErrors)) {
        nextErrors.companionDetails = companionErrors;
      }
    }

    if (purpose === "delivery" && !deliveryPartner.trim()) {
      nextErrors.deliveryPartner = deliveryPartnerIsOther
        ? "Enter where the delivery is from"
        : "Select a delivery partner";
    }

    if ((purpose === "service" || purpose === "maintenance") && !serviceProvider.trim()) {
      nextErrors.serviceProvider = "Provider or company name is required";
    }

    if (purpose === "cab") {
      if (!vehicleNumber.trim()) {
        nextErrors.vehicleNumber = "Vehicle number is required";
      }
      if (!vehicleType) {
        nextErrors.vehicleType = "Vehicle type is required";
      }
    }

    setErrors(nextErrors);
    return nextErrors;
  }, [
    companions,
    companionsCount,
    deliveryPartner,
    deliveryPartnerIsOther,
    fullName,
    phoneNumber,
    purpose,
    selectedFlat?.id,
    serviceProvider,
    vehicleNumber,
    vehicleType,
  ]);

  const isFormValid = useMemo(() => {
    if (!purpose) {
      return false;
    }
    if (!isStaffPurpose(purpose) && !selectedFlat?.id) {
      return false;
    }
    if ((requiresName(purpose) || isStaffPurpose(purpose)) && !fullName.trim()) {
      return false;
    }
    if ((requiresPhone(purpose) || isStaffPurpose(purpose)) && !isValidPhone(phoneNumber)) {
      return false;
    }
    if (purpose === "delivery" && !deliveryPartner.trim()) {
      return false;
    }
    if ((purpose === "service" || purpose === "maintenance") && !serviceProvider.trim()) {
      return false;
    }
    if (purpose === "cab" && (!vehicleNumber.trim() || !vehicleType)) {
      return false;
    }
    if (
      purpose === "guest" &&
      companionsCount > 0 &&
      hasCompanionDetailErrors(validateCompanionDetails(companions, companionsCount))
    ) {
      return false;
    }
    return true;
  }, [
    companions,
    companionsCount,
    deliveryPartner,
    fullName,
    phoneNumber,
    purpose,
    selectedFlat?.id,
    serviceProvider,
    vehicleNumber,
    vehicleType,
  ]);

  const resetForm = useCallback(() => {
    setFullName("");
    setPhoneNumber("");
    setEmail("");
    setSelectedFlat(null);
    setPurpose("guest");
    setVehicleNumber("");
    setVehicleType("");
    setDeliveryPartner("");
    setDeliveryPartnerIsOther(false);
    setServiceProvider("");
    setCompanionsCountState(0);
    setCompanions([]);
    setNotes("");
    setErrors({});
  }, []);

  const setCompanionsCount = useCallback((count: number) => {
    const nextCount = Math.max(0, count);
    setCompanionsCountState(nextCount);
    setCompanions((current) => resizeCompanions(current, nextCount));
  }, []);

  const updateCompanion = useCallback(
    (index: number, field: keyof CompanionDetail, value: string) => {
      setCompanions((current) => {
        const next = resizeCompanions(current, Math.max(current.length, index + 1));
        return next.map((companion, companionIndex) =>
          companionIndex === index ? { ...companion, [field]: value } : companion,
        );
      });
    },
    [],
  );

  const submit = useCallback(async () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      return { success: false as const, message: "Please fix the highlighted fields." };
    }

    const resolvedName =
      fullName.trim() ||
      deliveryPartner.trim() ||
      serviceProvider.trim() ||
      "Visitor";

    const resolvedCompanions =
      purpose === "guest" ? companionsCount : purpose === "delivery" || purpose === "cab" || purpose === "service" || purpose === "maintenance" ? 0 : companionsCount;

    const companionDetails =
      resolvedCompanions > 0
        ? companions.slice(0, resolvedCompanions).map((companion) => {
            const detail: Record<string, string> = {};
            const name = companion.name.trim();
            const phone = normalizePhone(companion.phoneNumber);

            if (name) {
              detail.full_name = name;
            }
            if (phone) {
              detail.phone_number = phone;
            }

            return detail;
          })
        : undefined;

    try {
      const response = await createEntry({
        societyId,
        modelsVisitorFormRequest: {
          companion_details: companionDetails,
          companions_count: resolvedCompanions,
          delivery_partner: deliveryPartner.trim() || undefined,
          email: email.trim() || undefined,
          flat_id: isStaffPurpose(purpose) ? undefined : selectedFlat!.id,
          full_name: resolvedName,
          metadata: { created_from: "guard_mobile" },
          notes: notes.trim() || undefined,
          phone_number: phoneNumber.trim() || undefined,
          purpose,
          service_provider: serviceProvider.trim() || undefined,
          vehicle_number: vehicleNumber.trim() || undefined,
          vehicle_type: vehicleType || undefined,
        },
      }).unwrap();

      const entry = response.data?.entry;
      const qrToken = response.data?.qr?.token;
      setCreatedEntry({ entry, qrToken });
      resetForm();

      return {
        success: true as const,
        message: response.message ?? "Visitor entry created",
        entry,
        qrToken,
      };
    } catch (error) {
      return {
        success: false as const,
        message: getApiMessage(error, "Please check the details and try again."),
      };
    }
  }, [
    companions,
    companionsCount,
    createEntry,
    deliveryPartner,
    email,
    fullName,
    notes,
    phoneNumber,
    purpose,
    resetForm,
    selectedFlat,
    serviceProvider,
    societyId,
    validate,
    vehicleNumber,
    vehicleType,
  ]);

  const clearCreatedEntry = useCallback(() => {
    setCreatedEntry(undefined);
  }, []);

  const selectDeliveryPartner = useCallback((partner: string) => {
    setDeliveryPartnerIsOther(false);
    setDeliveryPartner(partner);
  }, []);

  const selectCustomDeliveryPartner = useCallback(() => {
    setDeliveryPartnerIsOther(true);
    setDeliveryPartner("");
  }, []);

  const handleSetPurpose = useCallback((next: ModelsVisitorPurpose) => {
    setPurpose(next);
    if (next !== "delivery") {
      setDeliveryPartner("");
      setDeliveryPartnerIsOther(false);
    }
  }, []);

  return {
    clearCreatedEntry,
    companions,
    companionsCount,
    createdEntry,
    createEntryState,
    deliveryPartner,
    deliveryPartnerIsOther,
    email,
    errors,
    fullName,
    isFormValid,
    notes,
    optionalFieldsCount,
    phoneNumber,
    purpose,
    resetForm,
    selectedFlat,
    serviceProvider,
    setCompanionsCount,
    updateCompanion,
    setDeliveryPartner,
    setEmail,
    setFullName,
    setNotes,
    setPhoneNumber,
    setPurpose: handleSetPurpose,
    setSelectedFlat,
    setServiceProvider,
    setVehicleNumber,
    setVehicleType,
    selectCustomDeliveryPartner,
    selectDeliveryPartner,
    submit,
    validate,
    vehicleNumber,
    vehicleType,
  };
}
