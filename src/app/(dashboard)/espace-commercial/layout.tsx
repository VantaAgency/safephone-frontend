import type { ReactNode } from "react";
import { requireRouteRole } from "@/lib/auth/route-guard";

export default async function CommercialLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRouteRole("/espace-commercial", ["commercial"]);

  return <>{children}</>;
}
