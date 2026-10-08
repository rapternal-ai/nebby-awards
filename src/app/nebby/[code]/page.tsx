import { redirect } from "next/navigation";

export default async function NebbyIndexPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  redirect(`/nebby/${code}/feed`);
}
