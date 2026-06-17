export type TestimonialStatus = "pending" | "approved" | "rejected";
export type TestimonialSourceType = "text" | "image" | "ocr";
export type TestimonialDisplayStyle = "card" | "handwritten";

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  imageUrl?: string;
  imageAlt?: string;
  status: TestimonialStatus;
  city?: string;
  country?: string;
  sourceType?: TestimonialSourceType;
  extractedText?: string;
  displayStyle?: TestimonialDisplayStyle;
  ocrConfidence?: number;
  featured?: boolean;
  sortOrder?: number;
}
