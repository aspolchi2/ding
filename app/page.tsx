import Image from "next/image";
import { LoginForm } from "./components/Login";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-4">
      <LoginForm />
    </main>
  );
}
