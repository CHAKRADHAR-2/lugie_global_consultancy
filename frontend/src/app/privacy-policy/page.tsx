import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { APP_NAME } from "@/lib/constants";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy and data protection principles of Lugie Global Consultancy.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1 py-16 px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="border-b border-gray-100 pb-8 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[hsl(174,85%,32%)]">
            Legal & Compliance
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[hsl(215,50%,12%)] mt-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Last Updated: November 2026 · {APP_NAME}
          </p>
        </div>

        <div className="prose prose-sm text-gray-700 max-w-none space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-[hsl(215,50%,12%)]">1. Introduction</h2>
            <p>
              At {APP_NAME} (&quot;Lugie&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), we are committed to safeguarding the privacy and security of the personal and academic data entrusted to us by students, prospective applicants, and parents. This Privacy Policy details our practices concerning data collection, storage, processing, and disclosure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[hsl(215,50%,12%)]">2. Information We Collect</h2>
            <p>In order to provide overseas education consultancy and admissions guidance, we may collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Contact Information:</strong> Full name, email address, telephone/WhatsApp number, current residential city and state.</li>
              <li><strong>Academic Records:</strong> Transcripts, mark sheets, diplomas, degree certificates, backlogs history, GPA, and curriculum vitae.</li>
              <li><strong>Standardized Test Scores:</strong> IELTS, TOEFL, PTE, Duolingo, GRE, GMAT, or SAT score reports.</li>
              <li><strong>Identification & Travel Documents:</strong> Passport copies, nationality information, and date of birth.</li>
              <li><strong>Financial Overview:</strong> Sponsorship affidavits, bank solvency summaries, or education loan sanctions as strictly necessary for visa document verification.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[hsl(215,50%,12%)]">3. How We Use Your Data</h2>
            <p>Your personal information is utilized exclusively for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Evaluating academic eligibility for international programs.</li>
              <li>Submitting university applications with your explicit prior consent.</li>
              <li>Assisting with student visa appointment filings and checklist validation.</li>
              <li>Communicating status updates, admissions offers, and counseling sessions.</li>
              <li>Complying with applicable legal, regulatory, and audit obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[hsl(215,50%,12%)]">4. Absolute Anti-Spam & Zero Data Sale Commitment</h2>
            <p>
              <strong>We do not sell, rent, lease, or monetize your personal information to third-party telemarketers, commercial advertisers, or lead brokers under any circumstances.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[hsl(215,50%,12%)]">5. Document Security & Storage</h2>
            <p>
              Uploaded academic records and identity proofs are stored in isolated, access-controlled cloud infrastructure with encryption in transit (TLS 1.3) and encryption at rest. Access is restricted strictly to your assigned counsellor and supervising administrators.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[hsl(215,50%,12%)]">6. Your Rights</h2>
            <p>
              You have the right to request access to the data we hold concerning your profile, request corrections to erroneous records, or request complete deletion of your profile and documents upon conclusion of your service engagement, subject to statutory record-retention laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[hsl(215,50%,12%)]">7. Contact the Data Protection Officer</h2>
            <p>
              For any questions or privacy concerns, please contact our administrative desk at{" "}
              <a href="mailto:privacy@lugie.com" className="text-[hsl(174,85%,32%)] font-semibold underline">
                privacy@lugie.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
