import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useWizardFormContext } from "@/lib/react-hook-wizard-form";
import type { LoginOutput } from "./route";

export const Route = createFileRoute("/form/step-two")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const {
    useController,
    handleNext,
    handleKeyDown,
    formState: { errors },
  } = useWizardFormContext<LoginOutput>(["password"]);
  const { field: passwordField } = useController({ name: "password" });

  const onBack = async () => {
    await navigate({ to: "/form/step-one" });
  };
  const onNext = handleNext(async () => {
    await navigate({ to: "/form/confirm" });
  });
  const onKeyDown = handleKeyDown(onNext);
  return (
    <>
      <input type="password" {...passwordField} onKeyDown={onKeyDown} />
      {errors.password?.message}
      <button type="button" onClick={onBack}>
        Back
      </button>
      <button type="button" onClick={onNext}>
        Next
      </button>
    </>
  );
}
