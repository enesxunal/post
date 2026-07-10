import { redirect } from "next/navigation";

/** Eski /pricing adresi → Türkçe fiyatlandırma sayfası */
export default function PricingRedirectPage() {
  redirect("/fiyatlandirma");
}
