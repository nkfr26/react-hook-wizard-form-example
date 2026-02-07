import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useFormContext } from "react-hook-form";
import type { LoginOutput } from "./route";

export const Route = createFileRoute("/form/confirm")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { getValues } = useFormContext<LoginOutput>();
  return (
    <>
      {JSON.stringify(getValues())}
      <button type="button" onClick={() => navigate({ to: "/form/step-two" })}>
        Back
      </button>
      <button type="submit">Submit</button>
    </>
  );
}
