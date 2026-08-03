"use client";

import {
  Car,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  User,
  Users,
} from "lucide-react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  MAX_VISITOR_COMPANIONS,
  parseCompanionsCount,
} from "./visitor-invite-utils";

type VisitorInviteFormProps = {
  companionNames: string[];
  companionsCount: string;
  email: string;
  fullName: string;
  isSubmitting: boolean;
  notes: string;
  onCompanionNameChange: (index: number, value: string) => void;
  onCompanionsCountChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onSubmit: () => void;
  onToggleOptional: () => void;
  phoneNumber: string;
  showOptional: boolean;
  vehicleNumber: string;
  onVehicleNumberChange: (value: string) => void;
};

export function VisitorInviteForm({
  companionNames,
  companionsCount,
  email,
  fullName,
  isSubmitting,
  notes,
  onCompanionNameChange,
  onCompanionsCountChange,
  onEmailChange,
  onFullNameChange,
  onNotesChange,
  onPhoneNumberChange,
  onSubmit,
  onToggleOptional,
  onVehicleNumberChange,
  phoneNumber,
  showOptional,
  vehicleNumber,
}: VisitorInviteFormProps) {
  const parsedCompanionsCount = parseCompanionsCount(companionsCount);
  const companionSlots =
    parsedCompanionsCount !== null && parsedCompanionsCount > 0
      ? parsedCompanionsCount
      : 0;

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <FormField
        autoComplete="name"
        icon={<User className="size-4" />}
        id="visitor-full-name"
        label="Full name"
        placeholder="Your full name"
        required
        value={fullName}
        onChange={(event) => onFullNameChange(event.target.value)}
      />

      <FormField
        autoComplete="tel"
        icon={<Phone className="size-4" />}
        id="visitor-phone"
        inputMode="tel"
        label="Phone number"
        placeholder="10-digit mobile number"
        value={phoneNumber}
        onChange={(event) => onPhoneNumberChange(event.target.value)}
      />

      <FormField
        hint={`People accompanying you, not including yourself. Enter 0 if none. Max ${MAX_VISITOR_COMPANIONS}.`}
        icon={<Users className="size-4" />}
        id="visitor-companions-count"
        inputMode="numeric"
        label="Companion count"
        placeholder="0"
        required
        value={companionsCount}
        onChange={(event) => onCompanionsCountChange(event.target.value)}
      />

      {companionSlots > 0 ? (
        <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
          <div>
            <p className="font-medium text-sm">Companion details</p>
            <p className="text-muted-foreground text-xs">
              Optional — helps security identify everyone in your group.
            </p>
          </div>
          {companionNames.slice(0, companionSlots).map((name, index) => (
            <FormField
              key={`companion-${index + 1}`}
              autoComplete="name"
              id={`visitor-companion-${index + 1}`}
              label={`Companion ${index + 1} name`}
              placeholder="Optional"
              value={name}
              onChange={(event) =>
                onCompanionNameChange(index, event.target.value)
              }
            />
          ))}
        </div>
      ) : null}

      <Button
        className="w-full justify-between"
        type="button"
        variant="ghost"
        onClick={onToggleOptional}
      >
        <span>
          {showOptional ? "Hide optional details" : "Add optional details"}
        </span>
        {showOptional ? (
          <ChevronUp className="size-4" />
        ) : (
          <ChevronDown className="size-4" />
        )}
      </Button>

      {showOptional ? (
        <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
          <FormField
            autoComplete="email"
            icon={<Mail className="size-4" />}
            id="visitor-email"
            label="Email"
            placeholder="Optional"
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
          />

          <FormField
            autoCapitalize="characters"
            className="uppercase"
            icon={<Car className="size-4" />}
            id="visitor-vehicle"
            label="Vehicle number"
            placeholder="Optional"
            value={vehicleNumber}
            onChange={(event) => onVehicleNumberChange(event.target.value)}
          />

          <label className="block space-y-2.5" htmlFor="visitor-notes">
            <span className="font-medium text-sm">Notes</span>
            <textarea
              className={cn(
                "flex min-h-24 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-xs outline-none transition-[color,box-shadow]",
                "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              )}
              id="visitor-notes"
              placeholder="Optional message for security"
              rows={3}
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
            />
          </label>
        </div>
      ) : null}

      <Button
        className="w-full"
        disabled={isSubmitting}
        size="lg"
        type="submit"
      >
        {isSubmitting ? "Submitting..." : "Submit and get entry QR"}
      </Button>
    </form>
  );
}
