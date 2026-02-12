import React from "react";
import {
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  type FormProviderProps,
  type UseControllerProps,
  type UseControllerReturn,
  type UseFormRegister,
  useController,
  useFormContext,
  useFormState,
} from "react-hook-form";

type RevalidationContext = {
  shouldRevalidate: boolean;
  setShouldRevalidate: React.Dispatch<React.SetStateAction<boolean>>;
};
const RevalidationContext = React.createContext<RevalidationContext | null>(
  null,
);

export function WizardFormProvider<TFieldValues extends FieldValues>(
  props: FormProviderProps<TFieldValues>,
) {
  const [shouldRevalidate, setShouldRevalidate] = React.useState(false);
  return (
    <FormProvider {...props}>
      <RevalidationContext value={{ shouldRevalidate, setShouldRevalidate }}>
        {props.children}
      </RevalidationContext>
    </FormProvider>
  );
}

export function useWizardFormContext<TFieldValues extends FieldValues>(
  name?:
    | FieldPath<TFieldValues>
    | FieldPath<TFieldValues>[]
    | readonly FieldPath<TFieldValues>[],
) {
  const formContext = useFormContext<TFieldValues>();
  const revalidationContext = React.useContext(RevalidationContext);
  if (!revalidationContext) {
    throw new Error(
      "useWizardFormContext must be used within a WizardFormProvider",
    );
  }

  const next =
    (onValid: (data: TFieldValues) => unknown | Promise<unknown>) =>
    async () => {
      if (await formContext.trigger(name)) {
        revalidationContext.setShouldRevalidate(false);
        await onValid(formContext.getValues());
      } else {
        revalidationContext.setShouldRevalidate(true);
      }
    };

  const register: UseFormRegister<TFieldValues> = (name, options) => {
    const register = formContext.register(name, options);
    return {
      ...register,
      onChange: async (event) => {
        await register.onChange(event);
        if (revalidationContext.shouldRevalidate) {
          await formContext.trigger(name);
        }
      },
      onBlur: async (event) => {
        await register.onBlur(event);
        if (revalidationContext.shouldRevalidate) {
          await formContext.trigger(name);
        }
      },
    };
  };

  const keyDown =
    (onNext: ReturnType<typeof next>) => (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onNext();
      }
    };

  return {
    ...formContext,
    register,
    handle: { next, keyDown },
    formState: useFormState(),
  };
}

export function useWizardController<TFieldValues extends FieldValues>(
  props: UseControllerProps<TFieldValues>,
): UseControllerReturn<TFieldValues> {
  const controller = useController(props);
  const formContext = useFormContext<TFieldValues>();
  const revalidationContext = React.useContext(RevalidationContext);
  if (!revalidationContext) {
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
        if (revalidationContext.shouldRevalidate) {
          await formContext.trigger(props.name);
        }
      },
      onBlur: async () => {
        controller.field.onBlur();
        if (revalidationContext.shouldRevalidate) {
          await formContext.trigger(props.name);
        }
      },
    },
  };
}

export const WizardController = <
  TFieldValues extends FieldValues = FieldValues,
>(
  props: ControllerProps<TFieldValues>,
) => props.render(useWizardController<TFieldValues>(props));
