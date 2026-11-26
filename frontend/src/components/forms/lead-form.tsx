"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { CheckCircle2, Loader2, Send } from "lucide-react";

const leadSchema = z.object({
  source: z.string().default("website_contact"),
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().max(100).optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Valid phone number is required").max(20),
  preferred_country: z.string().min(1, "Please select a destination"),
  preferred_course: z.string().min(1, "Preferred course or study field is required"),
  preferred_intake: z.string().optional(),
  current_qualification: z.string().optional(),
  message: z.string().max(2000).optional(),
  consent_given: z.boolean().refine((val) => val === true, {
    message: "You must consent to Lugie contacting you regarding your enquiry",
  }),
  website: z.string().max(255).optional(), // Honeypot field
});

type LeadFormValues = z.infer<typeof leadSchema>;

const POPULAR_COUNTRIES = [
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Germany",
  "Ireland",
  "New Zealand",
  "France",
  "Other",
];

const INTAKES = [
  "Spring 2027 (Jan/Feb)",
  "Fall 2027 (Aug/Sep)",
  "Spring 2028 (Jan/Feb)",
  "Fall 2028 (Aug/Sep)",
  "Undecided / Flexible",
];

interface LeadFormProps {
  source?: string;
  title?: string;
  description?: string;
  buttonText?: string;
}

export function LeadForm({
  source = "website_contact",
  title = "Get in Touch",
  description = "Fill out the form below and one of our dedicated counsellors will contact you within 24 hours.",
  buttonText = "Submit Enquiry",
}: LeadFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      source,
      consent_given: false,
      website: "",
    },
  });

  const onSubmit = async (data: LeadFormValues) => {
    // If honeypot is filled, silently discard or reject
    if (data.website && data.website.trim().length > 0) {
      toast.error("Invalid submission detected.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("leads/public", {
        ...data,
        source,
        consent_text:
          "I agree to receive communications from Lugie Global Consultancy regarding my overseas education enquiry.",
      });

      setSubmitted(true);
      toast.success("Thank you! Your enquiry has been received.");
      reset();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Submission failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-[hsl(220,13%,91%)] bg-white p-8 sm:p-12 text-center shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)] mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-bold text-[hsl(222,47%,11%)]">Enquiry Received!</h3>
        <p className="mt-3 text-[hsl(220,13%,46%)] max-w-md mx-auto">
          Thank you for reaching out to Lugie Global Consultancy. A certified counsellor has been
          notified and will review your profile to get back to you within 24 hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-8 rounded-lg bg-[hsl(166,72%,40%)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[hsl(166,72%,50%)]"
        >
          Submit Another Enquiry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[hsl(220,13%,91%)] bg-white p-6 sm:p-10 shadow-lg">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-[hsl(222,47%,11%)]">{title}</h3>
        {description && <p className="mt-2 text-sm text-[hsl(220,13%,46%)]">{description}</p>}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Honeypot field - hidden */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("website")}
          />
        </div>

        {/* Name fields */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[hsl(222,47%,11%)]">First Name *</label>
            <input
              type="text"
              placeholder="e.g. Rahul"
              className="mt-1 block w-full rounded-lg border border-[hsl(220,13%,91%)] px-3.5 py-2.5 text-sm text-[hsl(222,47%,11%)] focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
              {...register("first_name")}
            />
            {errors.first_name && (
              <p className="mt-1 text-xs text-rose-500">{errors.first_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(222,47%,11%)]">Last Name</label>
            <input
              type="text"
              placeholder="e.g. Sharma"
              className="mt-1 block w-full rounded-lg border border-[hsl(220,13%,91%)] px-3.5 py-2.5 text-sm text-[hsl(222,47%,11%)] focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
              {...register("last_name")}
            />
            {errors.last_name && (
              <p className="mt-1 text-xs text-rose-500">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        {/* Contact fields */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[hsl(222,47%,11%)]">Email Address *</label>
            <input
              type="email"
              placeholder="rahul@example.com"
              className="mt-1 block w-full rounded-lg border border-[hsl(220,13%,91%)] px-3.5 py-2.5 text-sm text-[hsl(222,47%,11%)] focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(222,47%,11%)]">Phone / WhatsApp *</label>
            <input
              type="tel"
              placeholder="+91 93927 34699"
              className="mt-1 block w-full rounded-lg border border-[hsl(220,13%,91%)] px-3.5 py-2.5 text-sm text-[hsl(222,47%,11%)] focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-rose-500">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[hsl(222,47%,11%)]">Preferred Country *</label>
            <select
              className="mt-1 block w-full rounded-lg border border-[hsl(220,13%,91%)] px-3.5 py-2.5 text-sm text-[hsl(222,47%,11%)] focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
              {...register("preferred_country")}
            >
              <option value="">Select study destination</option>
              {POPULAR_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.preferred_country && (
              <p className="mt-1 text-xs text-rose-500">{errors.preferred_country.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(222,47%,11%)]">Target Intake</label>
            <select
              className="mt-1 block w-full rounded-lg border border-[hsl(220,13%,91%)] px-3.5 py-2.5 text-sm text-[hsl(222,47%,11%)] focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
              {...register("preferred_intake")}
            >
              <option value="">Select intake season</option>
              {INTAKES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Academic Details */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[hsl(222,47%,11%)]">
              Target Course / Area of Study *
            </label>
            <input
              type="text"
              placeholder="e.g. MSc Data Science, MBA"
              className="mt-1 block w-full rounded-lg border border-[hsl(220,13%,91%)] px-3.5 py-2.5 text-sm text-[hsl(222,47%,11%)] focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
              {...register("preferred_course")}
            />
            {errors.preferred_course && (
              <p className="mt-1 text-xs text-rose-500">{errors.preferred_course.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(222,47%,11%)]">
              Current Highest Qualification
            </label>
            <input
              type="text"
              placeholder="e.g. B.Tech Computer Science (75%)"
              className="mt-1 block w-full rounded-lg border border-[hsl(220,13%,91%)] px-3.5 py-2.5 text-sm text-[hsl(222,47%,11%)] focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
              {...register("current_qualification")}
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-[hsl(222,47%,11%)]">
            Tell us about your background & goals (optional)
          </label>
          <textarea
            rows={3}
            placeholder="E.g., Budget considerations, specific universities in mind, test scores if any..."
            className="mt-1 block w-full rounded-lg border border-[hsl(220,13%,91%)] px-3.5 py-2.5 text-sm text-[hsl(222,47%,11%)] focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
            {...register("message")}
          />
        </div>

        {/* Consent Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-[hsl(220,13%,91%)] text-[hsl(166,72%,40%)] focus:ring-[hsl(166,72%,40%)]"
              {...register("consent_given")}
            />
            <span className="text-xs text-[hsl(220,13%,46%)] leading-relaxed">
              I agree to allow Lugie Global Consultancy to contact me via email, phone, or WhatsApp
              regarding my study abroad enquiry. I have read and agree to the{" "}
              <a href="/privacy-policy" target="_blank" className="text-[hsl(166,72%,40%)] hover:text-[hsl(166,72%,50%)] underline">
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {errors.consent_given && (
            <p className="mt-1 text-xs text-rose-500">{errors.consent_given.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-[hsl(166,72%,40%)] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[hsl(166,72%,50%)] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting Enquiry...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {buttonText}
            </>
          )}
        </button>

        <p className="text-center text-xs text-[hsl(220,13%,46%)] mt-2">
          🔒 Your personal data is secure. We never sell your information or spam you.
        </p>
      </form>
    </div>
  );
}
