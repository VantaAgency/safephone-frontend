import type { ReactNode } from "react";
import { requireRouteRole } from "@/lib/auth/route-guard";

export default async function PartnerLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRouteRole("/espace-partenaire", ["partner"]);

  return <>{children}</>;
}
