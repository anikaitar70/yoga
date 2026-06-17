import { revalidatePath } from "next/cache";

export function revalidateTestimonialPaths() {
  revalidatePath("/");
  revalidatePath("/yoga");
  revalidatePath("/healing");
  revalidatePath("/just-art-life");
}
