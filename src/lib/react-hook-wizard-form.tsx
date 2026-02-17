import React from "react";
import {
  type ControllerProps,
  type FieldValues,
  FormProvider,
  type FormProviderProps,
  type UseControllerProps,
  type UseControllerReturn,
  type UseFormHandleSubmit,
  type UseFormRegister,
  type UseFormReturn,
  type UseFormTrigger,
  useController,
  useFormContext,
  useFormState,
} from "react-hook-form";

const WizardContext = React.createContext<React.RefObject<boolean> | null>(
  null,
);

export function WizardFormProvider<TFieldValues extends FieldValues>(
  props: FormProviderProps<TFieldValues>,
) {
  return (
    <FormProvider {...props}>
      <WizardContext value={React.useRef(false)}>
        {props.children}
      </WizardContext>
    </FormProvider>
  );
}

export function useWizardFormContext<TFieldValues extends FieldValues>(
  ...[name, options]: Parameters<UseFormTrigger<TFieldValues>>
) {
  const formContext: UseFormReturn<TFieldValues> = {
    ...useFormContext<TFieldValues>(),
    formState: useFormState<TFieldValues>({ name }),
  };
  const shouldRevalidateRef = React.useContext(WizardContext);
  if (!shouldRevalidateRef) {
    throw new Error(
      "useWizardFormContext must be used within a WizardFormProvider",
    );
  }

  const next: UseFormHandleSubmit<TFieldValues> =
    (onValid, onInvalid) => async (e) => {
      e?.preventDefault();
      if (await formContext.trigger(name, options)) {
        await onValid(formContext.getValues(), e);
        shouldRevalidateRef.current = false;
      } else {
        shouldRevalidateRef.current = true;
        await onInvalid?.(formContext.formState.errors, e);
      }
    };

  const register: UseFormRegister<TFieldValues> = (name, options) => {
    const baseRegister = formContext.register(name, options);
    return {
      ...baseRegister,
      onChange: async (event) => {
        await baseRegister.onChange(event);
        if (shouldRevalidateRef.current) {
          await formContext.trigger(name);
        }
      },
      onBlur: async (event) => {
        await baseRegister.onBlur(event);
        if (shouldRevalidateRef.current) {
          await formContext.trigger(name);
        }
      },
      onKeyDown: (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
          event.preventDefault();
        }
      },
    };
  };

  const keyDown =
    (onNext: ReturnType<typeof next>) => async (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        await onNext();
      }
    };

  return {
    ...({ ...formContext, register } satisfies UseFormReturn<TFieldValues>),
    handle: { next, keyDown },
  };
}

export function useWizardController<TFieldValues extends FieldValues>(
  props: UseControllerProps<TFieldValues>,
): UseControllerReturn<TFieldValues> & {
  field: { onKeyDown: (event: React.KeyboardEvent) => void };
} {
  const [controller, formContext, shouldRevalidateRef] = [
    useController(props),
    useFormContext<TFieldValues>(),
    React.useContext(WizardContext),
  ];
  if (!shouldRevalidateRef) {
    throw new Error(
      "useWizardController must be used within a WizardFormProvider",
    );
  }
  return {
    ...controller,
    field: {
      ...controller.field,
      onChange: async (...event) => {
        controller.field.onChange(...event);
        if (shouldRevalidateRef.current) {
          await formContext.trigger(props.name);
        }
      },
      onBlur: async () => {
        controller.field.onBlur();
        if (shouldRevalidateRef.current) {
          await formContext.trigger(props.name);
        }
      },
      onKeyDown: (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
          event.preventDefault();
        }
      },
    },
  };
}

export const WizardController = <TFieldValues extends FieldValues>(
  props: ControllerProps<TFieldValues>,
) => props.render(useWizardController<TFieldValues>(props));
