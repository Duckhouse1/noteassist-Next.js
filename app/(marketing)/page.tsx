import { cookies } from "next/headers";
import LandingPage from "./components/landing/LandingPage";

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get("NoteAssistSession");

  // if (session) {
  //   redirect("/dashboard");
  // }
    // redirect("/login");

  return <LandingPage />;
}

