"use client";

import { useForm } from "@tanstack/react-form";
import {
  useId,
  useRef,
  useState,
  type SubmitEvent,
  type ComponentProps,
} from "react";
import { useLocale } from "next-intl";
import type { z } from "zod";

type Props = ComponentProps<"form"> & {
  schema: z.ZodType;
  values?: Record<string, unknown>;
};

export function SchemaForm({
  schema,
  values,
  onSubmit,
  onChange,
  children,
  ...props
}: Props) {
  const id = useId();
  const bn = useLocale() === "bn";
  const [issues, setIssues] = useState<z.core.$ZodIssue[]>([]);
  const submitted = useRef<{
    event: SubmitEvent<HTMLFormElement>;
    element: HTMLFormElement;
  } | null>(null);
  const form = useForm({
    defaultValues: { fields: {} as Record<string, unknown> },
    validators: {
      onSubmit: ({ value }) => {
        const result = schema.safeParse(value.fields);
        setIssues(result.success ? [] : result.error.issues);
        const element = submitted.current?.element;
        if (element && !result.success) {
          for (const issue of result.error.issues) {
            const field = element.elements.namedItem(
              String(issue.path[0] ?? ""),
            );
            if (field instanceof HTMLElement) {
              field.setAttribute("aria-invalid", "true");
              field.setAttribute("aria-describedby", `${id}-errors`);
            }
          }
        }
        return result.success ? undefined : "Review the highlighted fields";
      },
    },
    onSubmit: () => {
      const entry = submitted.current;
      if (entry)
        onSubmit?.({
          ...entry.event,
          currentTarget: entry.element,
          target: entry.element,
          preventDefault: () => {},
        });
    },
  });
  const capture = (element: HTMLFormElement) => {
    const fields: Record<string, unknown> = Object.fromEntries(
      new FormData(element),
    );
    for (const control of Array.from(element.elements)) {
      if (control instanceof HTMLInputElement && control.name) {
        if (control.type === "checkbox") fields[control.name] = control.checked;
        if (control.type === "number")
          fields[control.name] =
            control.value === "" ? null : Number(control.value);
      }
    }
    form.setFieldValue("fields", { ...fields, ...values });
  };
  return (
    <form
      {...props}
      noValidate
      onChange={(event) => {
        capture(event.currentTarget);
        setIssues([]);
        if (event.target instanceof HTMLElement)
          event.target.removeAttribute("aria-invalid");
        onChange?.(event);
      }}
      onSubmit={(event) => {
        event.preventDefault();
        submitted.current = { event, element: event.currentTarget };
        capture(event.currentTarget);
        void form.handleSubmit();
      }}
    >
      {children}
      {!!issues.length && (
        <div
          id={`${id}-errors`}
          role="alert"
          className="col-span-full rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <p className="font-semibold">
            {bn ? "নিচের তথ্যগুলো ঠিক করুন" : "Please correct these fields"}
          </p>
          <ul className="mt-2 list-inside list-disc space-y-2">
            {issues.map((issue) => {
              const name = String(issue.path[0] ?? "");
              const element =
                submitted.current?.element.elements.namedItem(name);
              const label =
                element instanceof HTMLElement
                  ? element
                      .closest("label")
                      ?.childNodes[0]?.textContent?.trim() || name
                  : name;
              return (
                <li key={`${issue.path.join(".")}-${issue.message}`}>
                  <button
                    type="button"
                    className="text-left underline"
                    onClick={() => {
                      if (element instanceof HTMLElement) {
                        element.setAttribute("aria-invalid", "true");
                        element.setAttribute(
                          "aria-describedby",
                          `${id}-errors`,
                        );
                        element.focus();
                      }
                    }}
                  >
                    {label ? `${label}: ` : ""}
                    {bn
                      ? "সঠিক তথ্য দিন; নির্ধারিত সীমা ও বিন্যাস যাচাই করুন।"
                      : issue.message}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </form>
  );
}
