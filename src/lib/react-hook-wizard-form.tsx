import React from "react";
import {
  type FieldPath,
  type FieldValues,
  FormProvider,
  type FormProviderProps,
  useFormContext,
  useFormState,
  useController as useRhfController,
} from "react-hook-form";

type WizardContext = {
  shouldRevalidate: boolean;
  setShouldRevalidate: React.Dispatch<React.SetStateAction<boolean>>;
};
const WizardContext = React.createContext<WizardContext | null>(null);

export function WizardFormProvider<TFieldValues extends FieldValues>(
  props: FormProviderProps<TFieldValues>,
) {
  const [shouldRevalidate, setShouldRevalidate] = React.useState(false);
  return (
    <FormProvider {...props}>
      <WizardContext value={{ shouldRevalidate, setShouldRevalidate }}>
        {props.children}
      </WizardContext>
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
  const wizardContext = React.useContext(WizardContext);
  if (!wizardContext) {
    throw new Error(
      "useWizardFormContext must be used within a WizardFormProvider",
    );
  }

  const next =
    (onValid: (data: TFieldValues) => unknown | Promise<unknown>) =>
    async () => {
      if (await formContext.trigger(name)) {
        wizardContext.setShouldRevalidate(false);
        await onValid(formContext.getValues());
      } else {
        wizardContext.setShouldRevalidate(true);
      }
    };

  const register: typeof formContext.register = (name) => {
    const register = formContext.register(name);
    return {
      ...register,
      onChange: async (event) => {
        await register.onChange(event);
        if (wizardContext.shouldRevalidate) {
          await formContext.trigger(name);
        }
      },
      onBlur: async (event) => {
        await register.onBlur(event);
        if (wizardContext.shouldRevalidate) {
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

  const useController: typeof useRhfController<TFieldValues> = (props) => {
    const controller = useRhfController(props);
    return {
      ...controller,
      field: {
        ...controller.field,
        onChange: async (...event) => {
          controller.field.onChange(...event);
          if (wizardContext.shouldRevalidate) {
            await formContext.trigger(props.name);
          }
        },
        onBlur: async () => {
          controller.field.onBlur();
          if (wizardContext.shouldRevalidate) {
            await formContext.trigger(props.name);
          }
        },
      },
    };
  };

  return {
    ...formContext,
    register,
    useController,
    handle: { next, keyDown },
    formState: useFormState(),
  };
}
