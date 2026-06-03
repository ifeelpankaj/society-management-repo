"use client";

import { Home } from "lucide-react";
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
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { PageShell } from "@/components/shared/page-shell";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { usePostV1SocietiesBySocietyIdFlatsMutation } from "@/lib/api/generated-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import { getErrorText } from "@/lib/form/form-error";
import { paths } from "@/lib/routes/paths";

type CreateFlatClientProps = {
  societyId: number;
  encodedSocietyId: string;
};

type CreateFlatFormValues = {
  flat_number: string;
  block: string;
  floor: string;
};

const defaultValues: CreateFlatFormValues = {
  flat_number: "",
  block: "",
  floor: "",
};

function requiredLength(value: string, min = 1) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length >= min;
}

function optionalMaxLength(value: string, max: number) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length <= max;
}

function CreateFlatFields({
  form,
}: {
  form: UseFormReturn<CreateFlatFormValues>;
}) {
  const { errors } = useFormState({ control: form.control });
  const [flatNumber, block, floor] = useWatch({
    control: form.control,
    name: ["flat_number", "block", "floor"],
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        autoFocus
        containerClassName="sm:col-span-2"
        error={getErrorText(errors.flat_number)}
        icon={<Home className="size-4" />}
        id="flat-number"
        label="Flat number"
        placeholder="A-101"
        valid={requiredLength(flatNumber)}
        {...form.register("flat_number", {
          required: "Flat number is required.",
          maxLength: { value: 50, message: "Use at most 50 characters" },
        })}
      />
      <FormField
        error={getErrorText(errors.block)}
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

export function CreateFlatClient({
  societyId,
  encodedSocietyId: _encodedSocietyId,
}: CreateFlatClientProps) {
  const router = useRouter();
  const flatsHref = paths.flats(societyId);
  const [createFlat, { isLoading }] =
    usePostV1SocietiesBySocietyIdFlatsMutation();

  const submitFlat: SubmitHandler<CreateFlatFormValues> = async (values) => {
    const toastId = toast.loading("Creating flat...");

    try {
      const response = await createFlat({
        societyId,
        modelsCreateFlatRequest: {
          flat_number: values.flat_number.trim(),
          block: values.block.trim() || undefined,
          floor: values.floor.trim() || undefined,
        },
      }).unwrap();

      toast.success(getApiMessage(response, "Flat created successfully."), {
        id: toastId,
      });
      router.push(flatsHref);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create flat."), {
        id: toastId,
      });
    }
  };

  return (
    <PageShell background="tinted" className="min-h-full py-8">
      <main className="mx-auto w-full max-w-3xl space-y-6">
        <BackLink href={flatsHref} label="Flats" />
        <PageHeader
          description="Create one flat in this society workspace."
          eyebrow="Community inventory"
          title="Add flat"
        />

        <SectionCard
          description="Create one flat in this society workspace."
          title={
            <span className="flex items-center gap-2">
              <Home className="size-4" />
              Flat details
            </span>
          }
        >
          <SmartForm<CreateFlatFormValues>
            defaultValues={defaultValues}
            formOptions={{ mode: "onChange" }}
            onSubmit={submitFlat}
            actions={
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button asChild disabled={isLoading} variant="outline">
                  <Link href={flatsHref}>Cancel</Link>
                </Button>
                <Button disabled={isLoading} type="submit">
                  {isLoading ? "Creating..." : "Create flat"}
                </Button>
              </div>
            }
          >
            {(form) => <CreateFlatFields form={form} />}
          </SmartForm>
        </SectionCard>
      </main>
    </PageShell>
  );
}
