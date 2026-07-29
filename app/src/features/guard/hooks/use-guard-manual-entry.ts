import { useCallback, useMemo, useState } from "react";

import { getApiMessage } from "@/features/auth/api-error";
import {
  type ModelsFlatResponse,
  type ModelsVisitorEntry,
  type ModelsVisitorPurpose,
  usePostV1SocietiesBySocietyIdVisitorEntriesGuardMutation,
} from "@/lib/api/generated-api";

export type SelectedFlat = {
  id: number;
  block?: string;
  flat_number?: string;
  floor?: string;
};

export type ManualEntryFormErrors = {
  fullName?: string;
  phoneNumber?: string;
  flat?: string;
  companionsCount?: string;
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
  const [companionsCount, setCompanionsCount] = useState(0);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<ManualEntryFormErrors>({});
  const [createdEntry, setCreatedEntry] = useState<CreatedEntryState>();

  const [createEntry, createEntryState] = usePostV1SocietiesBySocietyIdVisitorEntriesGuardMutation();

  const optionalFieldsCount = useMemo(() => {
    let count = 0;
    if (email.trim()) count += 1;
    if (vehicleNumber.trim()) count += 1;
    if (companionsCount > 0) count += 1;
    if (notes.trim()) count += 1;
    return count;
  }, [companionsCount, email, notes, vehicleNumber]);

  const isFormValid = useMemo(
    () =>
      Boolean(fullName.trim()) &&
      isValidPhone(phoneNumber) &&
      Boolean(selectedFlat?.id) &&
      Boolean(purpose),
    [fullName, phoneNumber, purpose, selectedFlat?.id],
  );

  const validate = useCallback((): ManualEntryFormErrors => {
    const nextErrors: ManualEntryFormErrors = {};

    if (!fullName.trim()) {
      nextErrors.fullName = "Visitor name is required";
    }

    if (!phoneNumber.trim()) {
      nextErrors.phoneNumber = "Phone number is required";
    } else if (!isValidPhone(phoneNumber)) {
      nextErrors.phoneNumber = "Enter a valid 10-digit phone number";
    }

    if (!selectedFlat?.id) {
      nextErrors.flat = "Select a visiting flat";
    }

    if (companionsCount < 0) {
      nextErrors.companionsCount = "Companions cannot be negative";
    }

    setErrors(nextErrors);
    return nextErrors;
  }, [companionsCount, fullName, phoneNumber, selectedFlat?.id]);

  const resetForm = useCallback(() => {
    setFullName("");
    setPhoneNumber("");
    setEmail("");
    setSelectedFlat(null);
    setPurpose("guest");
    setVehicleNumber("");
    setCompanionsCount(0);
    setNotes("");
    setErrors({});
  }, []);

  const submit = useCallback(async () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      return { success: false as const, message: "Please fix the highlighted fields." };
    }

    try {
      const response = await createEntry({
        societyId,
        modelsVisitorFormRequest: {
          companions_count: companionsCount > 0 ? companionsCount : undefined,
          email: email.trim() || undefined,
          flat_id: selectedFlat!.id,
          full_name: fullName.trim(),
          metadata: { created_from: "guard_mobile" },
          notes: notes.trim() || undefined,
          phone_number: phoneNumber.trim(),
          purpose,
          vehicle_number: vehicleNumber.trim() || undefined,
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
    companionsCount,
    createEntry,
    email,
    fullName,
    notes,
    phoneNumber,
    purpose,
    resetForm,
    selectedFlat,
    societyId,
    validate,
    vehicleNumber,
  ]);

  const clearCreatedEntry = useCallback(() => {
    setCreatedEntry(undefined);
  }, []);

  return {
    clearCreatedEntry,
    companionsCount,
    createdEntry,
    createEntryState,
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
    setCompanionsCount,
    setEmail,
    setFullName,
    setNotes,
    setPhoneNumber,
    setPurpose,
    setSelectedFlat,
    setVehicleNumber,
    submit,
    validate,
    vehicleNumber,
  };
}
