import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { useWizardFormContext } from "@/lib/react-hook-wizard-form";
import type { LoginOutput } from "./route";

export const Route = createFileRoute("/form/step-one")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const {
    register,
    handleNext,
    handleKeyDown,
    formState: { errors },
  } = useWizardFormContext<LoginOutput>({
    fieldPaths: ["email"],
  });

  const onNext = handleNext((data) => {
    console.log(data);
    navigate({ to: "/form/step-two" });
  });
  const onKeyDown = handleKeyDown(onNext);
  return (
    <>
      <Input type="email" {...register("email")} onKeyDown={onKeyDown} />
      {errors.email?.message}
      <button type="button" onClick={onNext}>
        Next
      </button>
    </>
  );
}
