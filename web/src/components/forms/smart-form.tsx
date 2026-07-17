"use client";

import type { ReactNode } from "react";
import {
  type DefaultValues,
  type FieldValues,
  FormProvider,
  type SubmitHandler,
  type UseFormProps,
  type UseFormReturn,
  useForm,
} from "react-hook-form";

import { cn } from "@/lib/utils";

type SmartFormChildren<TFieldValues extends FieldValues> =
  | ReactNode
  | ((form: UseFormReturn<TFieldValues>) => ReactNode);

type SmartFormProps<TFieldValues extends FieldValues> = {
  children: SmartFormChildren<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  actions?: ReactNode;
  form?: UseFormReturn<TFieldValues>;
  defaultValues?: DefaultValues<TFieldValues>;
  formOptions?: Omit<UseFormProps<TFieldValues>, "defaultValues">;
  className?: string;
  contentClassName?: string;
};

function SmartForm<TFieldValues extends FieldValues>({
  children,
  actions,
  onSubmit,
  form,
  defaultValues,
  formOptions,
  className,
  contentClassName,
}: SmartFormProps<TFieldValues>) {
  const internalForm = useForm<TFieldValues>({
    defaultValues,
    ...formOptions,
  });
  const methods = form ?? internalForm;

  return (
    <FormProvider {...methods}>
      <form
        data-slot="smart-form"
        className={cn("space-y-6", className)}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <div className={cn("space-y-4", contentClassName)}>
          {typeof children === "function" ? children(methods) : children}
        </div>
        {actions ? (
          <div className="flex flex-col-reverse gap-2 border-border border-t pt-4 sm:flex-row sm:justify-end">
            {actions}
          </div>
        ) : null}
      </form>
    </FormProvider>
  );
}

export { SmartForm, type SmartFormProps };
