import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions governing consultancy services provided by Lugie Global Consultancy.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1 py-16 px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="border-b border-gray-100 pb-8 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[hsl(174,85%,32%)]">
            Terms of Service
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[hsl(215,50%,12%)] mt-2">
            Terms & Conditions
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Last Updated: November 2026 · {APP_NAME}
          </p>
        </div>

        <div className="prose prose-sm text-gray-700 max-w-none space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-[hsl(215,50%,12%)]">1. Nature of Consultancy Services</h2>
            <p>
              {APP_NAME} (&quot;Lugie&quot;) operates strictly as an educational advisory, career mapping, and application facilitation service. Our professional staff provides guidance regarding university eligibility, document review, and procedural visa checklist preparation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[hsl(215,50%,12%)]">2. Explicit No-Guarantee Disclaimer</h2>
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-5 text-rose-950 text-xs sm:text-sm font-medium space-y-2">
              <p>
                <strong>Admissions Disclaimer:</strong> University admissions decisions are made exclusively by the independent admissions boards and academic faculties of respective institutions. Lugie does not guarantee admission or interview invitations to any university or college.
              </p>
              <p>
                <strong>Visa Disclaimer:</strong> Visa adjudications, issuance, processing times, and refusal decisions are sovereign acts of respective foreign government diplomatic missions (embassies, consulates, and border control agencies). Lugie does not guarantee visa issuance or grant under any circumstances.
              </p>
              <p>
                <strong>Financial Disclaimer:</strong> Scholarships and loan sanctions are granted solely at the discretion of external granting organizations and financial institutions. Lugie does not guarantee scholarship awards or loan approvals.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[hsl(215,50%,12%)]">3. Student Responsibilities & Document Authenticity</h2>
            <p>
              The student expressly warrants and guarantees that all academic certificates, marks cards, letters of recommendation, bank balance certificates, and identity documents provided to Lugie are 100% genuine, authentic, and unaltered.
            </p>
            <p className="text-rose-700 font-medium">
              Lugie maintains zero tolerance for forged or counterfeit documentation. Any attempt to submit falsified documents will result in immediate termination of services without refund, and notification to relevant academic or visa bodies where legally mandated.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[hsl(215,50%,12%)]">4. Consultancy Fees & Third-Party Charges</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Our package prices (Basic ₹7,999, Standard ₹13,999, Premium ₹24,999) cover only professional advisory, editing, and guidance fees by Lugie consultants.</li>
              <li>All third-party charges — including but not limited to university application fees, credential evaluation fees (WES/Uni-Assist), standardized test fees (IELTS/TOEFL/GRE), embassy visa fees, biometrics fees, SEVIS fees, health insurance (NHS/OSHC), and courier services — are strictly the direct financial responsibility of the student.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[hsl(215,50%,12%)]">5. Jurisdiction & Dispute Resolution</h2>
            <p>
              These Terms & Conditions shall be governed by and construed in accordance with the laws of India. Any legal dispute, claim, or controversy arising out of or in connection with services rendered by {APP_NAME} shall be subject to the exclusive jurisdiction of the competent courts in Bangalore, Karnataka, India.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
