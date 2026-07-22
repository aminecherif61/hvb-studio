import ResetCard from "./ResetCard";

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <div className="flex min-h-svh items-center justify-center px-6 py-16">
      <ResetCard token={typeof token === "string" ? token : ""} />
    </div>
  );
}
