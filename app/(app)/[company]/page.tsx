import { redirect } from "next/navigation";

export default function CompanyRoot({ params }: { params: { company: string } }) {
  redirect(`/${params.company}/dashboard`);
}
