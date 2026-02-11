import React from "react";
import {
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
  type UseControllerReturn,
  type UseFormRegister,
  useFormContext,
  useFormState,
  useController as useRhfController,
} from "react-hook-form";

export function useWizardFormContext<TFieldValues extends FieldValues>(
  name?:
    | FieldPath<TFieldValues>
    | FieldPath<TFieldValues>[]
    | readonly FieldPath<TFieldValues>[],
) {
  const formContext = useFormContext<TFieldValues>();
  const [shouldRevalidate, setShouldRevalidate] = React.useState(false);

  const handleNext =
    (onValid: (data: TFieldValues) => unknown | Promise<unknown>) =>
    async () => {
      if (await formContext.trigger(name)) {
        await onValid(formContext.getValues());
      }
      setShouldRevalidate(true);
    };

  const register: UseFormRegister<TFieldValues> = (name) => {
    const { onChange, onBlur, ...restRegister } = formContext.register(name);
    return {
      ...restRegister,
      onChange: async (event) => {
        await onChange(event);
        if (shouldRevalidate) {
          await formContext.trigger(name);
        }
      },
      onBlur: async (event) => {
        await onBlur(event);
        if (shouldRevalidate) {
          await formContext.trigger(name);
        }
      },
    };
  };

  const handleKeyDown =
    (onNext: ReturnType<typeof handleNext>) => (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onNext();
      }
    };

  const useController = (
    props: UseControllerProps<TFieldValues>,
  ): UseControllerReturn<TFieldValues> => {
    const controller = useRhfController(props);
    return {
      ...controller,
      field: {
        ...controller.field,
        onChange: async (...event) => {
          controller.field.onChange(...event);
          if (shouldRevalidate) {
            await formContext.trigger(props.name);
          }
        },
        onBlur: async () => {
          controller.field.onBlur();
          if (shouldRevalidate) {
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
    handleNext,
    handleKeyDown,
    formState: useFormState(),
  };
}
