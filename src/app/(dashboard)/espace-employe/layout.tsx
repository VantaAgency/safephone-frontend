import type { ReactNode } from "react";
import { requireRouteRole } from "@/lib/auth/route-guard";

export default async function EmployeeLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRouteRole("/espace-employe", ["employee"]);

  return <>{children}</>;
}
