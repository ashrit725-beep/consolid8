import { redirect } from "next/navigation";
import { DEFAULT_ROUTE } from "@/config/navigation";

export default function RootPage() {
  redirect(DEFAULT_ROUTE);
}
