import { redirect } from "next/navigation";


type PageProps = {
  params: Promise<{ company: string }>;
};


export default async function CompanyRoot({ params }:PageProps ) {
  const { company } = await params;
  redirect(`/${company}/dashboard`);
}
