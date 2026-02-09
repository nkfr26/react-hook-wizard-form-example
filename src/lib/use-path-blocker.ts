import { useBlocker } from "@tanstack/react-router";
import type { FileRoutesByFullPath } from "@/routeTree.gen";

export function usePathBlocker({
  isDirty = true,
  pathname,
  message,
}: {
  isDirty?: boolean;
  pathname: keyof FileRoutesByFullPath;
  message: string;
}) {
  useBlocker({
    shouldBlockFn: ({ next }) =>
      isDirty && !next.pathname.startsWith(pathname) && !confirm(message),
    enableBeforeUnload: isDirty,
  });
}
