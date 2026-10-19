import { useState, useCallback, useMemo } from "react";
import type { ZodType } from "zod";
import { zodToFieldErrors, type FieldErrors } from "../lib/validation";

export interface UseZodFormOptions<T> {
  initialValues: T;
  schema: ZodType<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

export interface UseZodFormResult<T> {
  values: T;
  errors: FieldErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  submitting: boolean;
  serverError: string;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setTouched: (field: keyof T) => void;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  handleSubmit: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void>;
  reset: (nextValues?: T) => void;
  validateField: (field: keyof T) => void;
}

export function useZodForm<T>({
  initialValues,
  schema,
  onSubmit,
}: UseZodFormOptions<T>): UseZodFormResult<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [touched, setTouchedState] = useState<
    Partial<Record<keyof T, boolean>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value, type } = e.target;
      const v =
        type === "number" ? (value === "" ? undefined : Number(value)) : value;
      setValue(name as keyof T, v as T[keyof T]);
    },
    [setValue],
  );

  const setTouched = useCallback((field: keyof T) => {
    setTouchedState((prev) => ({ ...prev, [field]: true }));
  }, []);

  const validateField = useCallback(
    (field: keyof T) => {
      const parsed = schema.safeParse(values);
      if (!parsed.success) {
        const allErrors = zodToFieldErrors(parsed.error);
        setErrors((prev) => ({ ...prev, [field]: allErrors[field] }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [schema, values],
  );

  const handleSubmit = useCallback(
    async (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      setServerError("");
      const parsed = schema.safeParse(values);
      if (!parsed.success) {
        setErrors(zodToFieldErrors(parsed.error));
        // Mark all as touched so errors show
        const allTouched: Partial<Record<keyof T, boolean>> = {};
        for (const k of Object.keys(values as object)) {
          allTouched[k as keyof T] = true;
        }
        setTouchedState(allTouched);
        return;
      }
      setSubmitting(true);
      try {
        await onSubmit(parsed.data);
      } catch (err) {
        setServerError(
          err instanceof Error ? err.message : "Submission failed",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [schema, values, onSubmit],
  );

  const reset = useCallback(
    (nextValues?: T) => {
      setValues(nextValues ?? initialValues);
      setErrors({});
      setTouchedState({});
      setServerError("");
    },
    [initialValues],
  );

  return useMemo(
    () => ({
      values,
      errors,
      touched,
      submitting,
      serverError,
      setValue,
      setTouched,
      handleChange,
      handleSubmit,
      reset,
      validateField,
    }),
    [
      values,
      errors,
      touched,
      submitting,
      serverError,
      setValue,
      setTouched,
      handleChange,
      handleSubmit,
      reset,
      validateField,
    ],
  );
}
