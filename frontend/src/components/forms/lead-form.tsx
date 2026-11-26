"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback";
import { CheckCircle2, Lock, Send } from "lucide-react";

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
  website: z.string().max(255).optional(),
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

const inputClasses =
  "mt-1.5 block w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition-colors";

export function LeadForm({
  source = "website_contact",
  title = "Get in Touch",
  description = "Fill out the form below and one of our dedicated counsellors will contact you within 24 hours.",
  buttonText = "Submit Enquiry",
}: LeadFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    setSubmitError(null);

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
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="beyond-card p-8 sm:p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EDF5F1] border border-[#B7CBC2] text-[#2F6B55] mb-6">
          <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
        </div>
        <h3 className="font-editorial text-2xl text-[#394B49]">Enquiry Received</h3>
        <p className="mt-3 text-sm text-[#546866] max-w-md mx-auto leading-relaxed">
          Thank you for reaching out to Lugie Global Consultancy. A certified counsellor has been
          notified and will review your profile within 24 hours.
        </p>
        <div className="mt-8">
          <Button variant="primary" size="md" onClick={() => setSubmitted(false)}>
            Submit Another Enquiry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="beyond-card p-6 sm:p-10">
      <div className="mb-8 border-b border-[#DCE5E8] pb-5">
        <h3 className="font-editorial text-2xl text-[#394B49]">{title}</h3>
        {description && <p className="mt-1.5 text-sm text-[#546866]">{description}</p>}
      </div>

      {submitError && (
        <div className="mb-6">
          <FeedbackBanner tone="error" title="Could not submit enquiry" message={submitError} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Honeypot field */}
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
            <label htmlFor="lead-first-name" className="block text-xs font-semibold text-[#394B49]">
              First Name *
            </label>
            <input
              id="lead-first-name"
              type="text"
              placeholder="e.g. Rahul"
              className={inputClasses}
              {...register("first_name")}
            />
            {errors.first_name && (
              <p className="mt-1 text-xs text-[#A63A3A]" role="alert">{errors.first_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lead-last-name" className="block text-xs font-semibold text-[#394B49]">
              Last Name
            </label>
            <input
              id="lead-last-name"
              type="text"
              placeholder="e.g. Sharma"
              className={inputClasses}
              {...register("last_name")}
            />
            {errors.last_name && (
              <p className="mt-1 text-xs text-[#A63A3A]" role="alert">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        {/* Contact fields */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="lead-email" className="block text-xs font-semibold text-[#394B49]">
              Email Address *
            </label>
            <input
              id="lead-email"
              type="email"
              placeholder="rahul@example.com"
              className={inputClasses}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-[#A63A3A]" role="alert">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lead-phone" className="block text-xs font-semibold text-[#394B49]">
              Phone / WhatsApp *
            </label>
            <input
              id="lead-phone"
              type="tel"
              placeholder="+91 93927 34699"
              className={inputClasses}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-[#A63A3A]" role="alert">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="lead-country" className="block text-xs font-semibold text-[#394B49]">
              Preferred Country *
            </label>
            <select
              id="lead-country"
              className={inputClasses}
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
              <p className="mt-1 text-xs text-[#A63A3A]" role="alert">{errors.preferred_country.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lead-intake" className="block text-xs font-semibold text-[#394B49]">
              Target Intake
            </label>
            <select
              id="lead-intake"
              className={inputClasses}
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
            <label htmlFor="lead-course" className="block text-xs font-semibold text-[#394B49]">
              Target Course / Area of Study *
            </label>
            <input
              id="lead-course"
              type="text"
              placeholder="e.g. MSc Data Science, MBA"
              className={inputClasses}
              {...register("preferred_course")}
            />
            {errors.preferred_course && (
              <p className="mt-1 text-xs text-[#A63A3A]" role="alert">{errors.preferred_course.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lead-qualification" className="block text-xs font-semibold text-[#394B49]">
              Current Highest Qualification
            </label>
            <input
              id="lead-qualification"
              type="text"
              placeholder="e.g. B.Tech Computer Science (75%)"
              className={inputClasses}
              {...register("current_qualification")}
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="lead-message" className="block text-xs font-semibold text-[#394B49]">
            Tell us about your background & goals (optional)
          </label>
          <textarea
            id="lead-message"
            rows={3}
            placeholder="E.g., Budget considerations, specific universities in mind, test scores if any..."
            className={inputClasses}
            {...register("message")}
          />
        </div>

        {/* Consent Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-[#B7CBC2] accent-[#394B49] focus:ring-[#394B49]"
              {...register("consent_given")}
            />
            <span className="text-xs text-[#546866] leading-relaxed">
              I agree to allow Lugie Global Consultancy to contact me via email, phone, or WhatsApp
              regarding my study abroad enquiry. I have read and agree to the{" "}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#8E572C] underline underline-offset-2 hover:text-[#394B49]"
              >
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {errors.consent_given && (
            <p className="mt-1 text-xs text-[#A63A3A]" role="alert">{errors.consent_given.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="warm"
          size="lg"
          loading={isSubmitting}
          loadingText="Submitting Enquiry…"
          className="w-full"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          <span>{buttonText}</span>
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-[#546866] mt-2">
          <Lock className="h-3.5 w-3.5 text-[#3F6258]" aria-hidden="true" />
          <span>Your personal data is kept confidential. Zero spam or third-party data sharing.</span>
        </p>
      </form>
    </div>
  );
}
