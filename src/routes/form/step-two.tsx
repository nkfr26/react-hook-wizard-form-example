import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  useWizardFormContext,
  WizardController,
} from "@/lib/react-hook-wizard-form";
import type { LoginOutput } from "./route";

export const Route = createFileRoute("/form/step-two")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { control, handle } = useWizardFormContext<LoginOutput>(["password"]);

  const onBack = async () => {
    await navigate({ to: "/form/step-one" });
  };
  const onNext = handle.next(async () => {
    await navigate({ to: "/form/confirm" });
  });
  const onKeyDown = handle.keyDown(onNext);
  return (
    <>
      <WizardController
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <>
            <input type="password" {...field} onKeyDown={onKeyDown} />
            {fieldState.error?.message}
          </>
        )}
      />
      <button type="button" onClick={onBack}>
        Back
      </button>
      <button type="button" onClick={onNext}>
        Next
      </button>
    </>
  );
}
