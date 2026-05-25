export type TestimonialStatus = "pending" | "approved" | "rejected";

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  status: TestimonialStatus;
}
