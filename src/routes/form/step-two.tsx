import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
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
  } = useWizardFormContext<LoginOutput>({
    fieldPaths: ["password"],
  });
  const { field: passwordField } = useController({ name: "password" });

  const onBack = () => {
    navigate({ to: "/form/step-one" });
  };
  const onNext = handleNext((data) => {
    console.log(data);
    navigate({ to: "/form/confirm" });
  });
  const onKeyDown = handleKeyDown(onNext);
  return (
    <>
      <Input type="password" {...passwordField} onKeyDown={onKeyDown} />
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
