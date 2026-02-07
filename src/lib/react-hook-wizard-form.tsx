import React from "react";
import {
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  Controller as RHFController,
  type UseFormRegister,
  useFormContext,
  useFormState,
} from "react-hook-form";

export function useWizardFormContext<TFieldValues extends FieldValues>({
  fieldPaths,
}: {
  fieldPaths: FieldPath<TFieldValues>[];
}) {
  const {
    trigger,
    getValues,
    register: rhfRegister,
    control,
    ...restUseFormContext
  } = useFormContext<TFieldValues>();
  const [shouldRevalidate, setShouldRevalidate] = React.useState(false);

  const handleNext =
    (onValid: (data: TFieldValues) => unknown | Promise<unknown>) =>
    async () => {
      if (await trigger(fieldPaths)) {
        await onValid(getValues());
      }
      setShouldRevalidate(true);
    };

  const register: UseFormRegister<TFieldValues> = (name) => {
    const { onChange, onBlur, ...restRegister } = rhfRegister(name);
    return {
      onChange: async (event) => {
        await onChange(event);
        if (shouldRevalidate) {
          await trigger(name);
        }
      },
      onBlur: async (event) => {
        await onBlur(event);
        if (shouldRevalidate) {
          await trigger(name);
        }
      },
      ...restRegister,
    };
  };

  const handleKeyDown =
    (onNext: ReturnType<typeof handleNext>) => (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onNext();
      }
    };

  const Controller = (
    props: Omit<ControllerProps<TFieldValues>, "control">,
  ) => {
    return (
      <RHFController
        {...props}
        control={control}
        render={(renderProps) => {
          const { field } = renderProps;
          return props.render({
            ...renderProps,
            field: {
              ...field,
              onChange: async (...event) => {
                field.onChange(...event);
                if (shouldRevalidate) {
                  await trigger(props.name);
                }
              },
              onBlur: async () => {
                field.onBlur();
                if (shouldRevalidate) {
                  await trigger(props.name);
                }
              },
            },
          });
        }}
      />
    );
  };

  return {
    handleNext,
    register,
    handleKeyDown,
    Controller,
    ...restUseFormContext,
    formState: useFormState({ control }),
  };
}
