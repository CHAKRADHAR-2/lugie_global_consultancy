/** Shared TypeScript types matching the backend models. */

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  roles: string[];
  is_active: boolean;
  created_at?: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  date_of_birth?: string | null;
  nationality?: string | null;
  current_city?: string | null;
  current_country?: string | null;
  preferred_countries?: string[] | null;
  preferred_courses?: string[] | null;
  budget_min?: number | null;
  budget_max?: number | null;
  budget_currency: string;
  preferred_intake?: string | null;
  profile_completion: number;
}

export interface University {
  id: string;
  country_id: string;
  name: string;
  type?: string | null;
  city?: string | null;
  website?: string | null;
  ranking?: number | null;
  is_active: boolean;
  is_verified: boolean;
  is_sample_data: boolean;
  country?: Country;
}

export interface Course {
  id: string;
  university_id: string;
  programme_name: string;
  degree_level?: string | null;
  teaching_language: string;
  duration_months?: number | null;
  tuition_fee?: number | null;
  tuition_currency?: string | null;
  official_url?: string | null;
  is_active: boolean;
  is_sample_data: boolean;
  university?: University;
}

export interface Country {
  id: string;
  name: string;
  code?: string | null;
  is_active: boolean;
}

export interface Application {
  id: string;
  student_id: string;
  course_id: string;
  intake_id?: string | null;
  assigned_counsellor_id?: string | null;
  status: string;
  submission_date?: string | null;
  deadline?: string | null;
  notes?: string | null;
  created_at: string;
  course?: Course;
}

export interface Lead {
  id: string;
  source: string;
  first_name: string;
  last_name?: string | null;
  email: string;
  phone?: string | null;
  message?: string | null;
  preferred_country?: string | null;
  preferred_course?: string | null;
  status: string;
  assigned_counsellor_id?: string | null;
  created_at: string;
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  is_recommended: boolean;
  is_active: boolean;
  inclusions?: PackageInclusion[];
}

export interface PackageInclusion {
  id: string;
  description: string;
  category?: string | null;
  limit_value?: string | null;
}

export interface AdditionalService {
  id: string;
  name: string;
  slug: string;
  price_min: number;
  price_max: number;
  currency: string;
  description?: string | null;
  is_active: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  type?: string | null;
  title?: string | null;
  message?: string | null;
  is_read: boolean;
  action_url?: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface ApiErrorResponse {
  detail: string;
  success?: boolean;
}
