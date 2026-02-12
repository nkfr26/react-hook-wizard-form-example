import { valibotResolver } from "@hookform/resolvers/valibot";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { flushSync } from "react-dom";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import { WizardFormProvider } from "@/lib/react-hook-wizard-form";
import { usePathBlocker } from "@/lib/use-path-blocker";

export const Route = createFileRoute("/form")({
  component: RouteComponent,
});

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});
export type LoginOutput = v.InferOutput<typeof LoginSchema>;

function RouteComponent() {
  const navigate = useNavigate();
  const methods = useForm<LoginOutput>({
    resolver: valibotResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = methods.handleSubmit(async () => {
    flushSync(() => methods.reset());
    await navigate({ to: "/" });
  });

  usePathBlocker({
    isDirty: methods.formState.isDirty,
    pathname: "/form",
    message: "このページを離れますか？行った変更は保存されません。",
  });
  return (
    <WizardFormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <Outlet />
      </form>
    </WizardFormProvider>
  );
}
