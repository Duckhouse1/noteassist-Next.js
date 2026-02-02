import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboardClient";

type PageProps = {
  params: Promise<{ company: string }>;
};

export default async function DashboardPage({ params }: PageProps) {
  const { company } = await params;

  const cookieStore = await cookies();
  const session = cookieStore.get("NoteAssistSession");

  if (!session) {
    redirect(`/company/${company}`);
  }

  return <DashboardClient company={company} />;
}
