import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F0E8] text-[#394B49]">
      <Header />
      <main className="beyond-surface flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
