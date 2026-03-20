import type { ReactNode } from "react";
import { requireRouteRole } from "@/lib/auth/route-guard";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRouteRole("/admin", ["admin"]);

  return <>{children}</>;
}
