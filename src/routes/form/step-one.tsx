import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useWizardFormContext } from "@/lib/react-hook-wizard-form";
import type { LoginOutput } from "./route";

export const Route = createFileRoute("/form/step-one")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const {
    register,
    handle,
    formState: { errors },
  } = useWizardFormContext<LoginOutput>(["email"]);

  const onNext = handle.next(async (data) => {
    console.log(data);
    await navigate({ to: "/form/step-two" });
  });
  const onKeyDown = handle.keyDown(onNext);
  return (
    <>
      <input type="email" {...register("email")} onKeyDown={onKeyDown} />
      {errors.email?.message}
      <button type="button" onClick={onNext}>
        Next
      </button>
    </>
  );
}
