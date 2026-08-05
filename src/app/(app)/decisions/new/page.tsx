import { redirect } from "next/navigation";

export default function NewDecisionPage() {
  redirect("/decisions?new=1");
}
