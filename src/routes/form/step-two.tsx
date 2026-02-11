import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useWizardFormContext } from "@/lib/react-hook-wizard-form";
import type { LoginOutput } from "./route";

export const Route = createFileRoute("/form/step-two")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { useController, handle } = useWizardFormContext<LoginOutput>([
    "password",
  ]);
  const password = useController({ name: "password" });

  const onBack = async () => {
    await navigate({ to: "/form/step-one" });
  };
  const onNext = handle.next(async () => {
    await navigate({ to: "/form/confirm" });
  });
  const onKeyDown = handle.keyDown(onNext);
  return (
    <>
      <input type="password" {...password.field} onKeyDown={onKeyDown} />
      {password.fieldState.error?.message}
      <button type="button" onClick={onBack}>
        Back
      </button>
      <button type="button" onClick={onNext}>
        Next
      </button>
    </>
  );
}
