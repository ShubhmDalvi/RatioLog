import { redirect } from "next/navigation";

export default async function EditDecisionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/decisions/${id}?edit=1`);
}
