import { valibotResolver } from "@hookform/resolvers/valibot";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { flushSync } from "react-dom";
import { FormProvider, useForm } from "react-hook-form";
import * as v from "valibot";
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
  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods;

  const onSubmit = handleSubmit(async () => {
    flushSync(() => reset());
    await navigate({ to: "/" });
  });

  usePathBlocker({
    isDirty,
    pathname: "/form",
    message: "Are you sure you want to leave?",
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <Outlet />
      </form>
    </FormProvider>
  );
}
