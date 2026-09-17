import { supabase } from "@/integrations/supabase/client";

export type ImageModerationResult = { allowed: boolean; reason: string | null };

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });

/**
 * Checks an image with the AI safety moderator BEFORE it is uploaded.
 * Throws an Error with a user-facing message when the image is blocked
 * or the check cannot be completed (fail-safe: never allow unchecked images).
 */
export async function assertImageSafe(file: File): Promise<void> {
  const dataUrl = await fileToDataUrl(file);
  const { data, error } = await supabase.functions.invoke<ImageModerationResult>("moderate-image", {
    body: { image: dataUrl },
  });

  if (error || !data) {
    throw new Error("We could not verify this image right now. Please try again.");
  }
  if (!data.allowed) {
    throw new Error(data.reason ? `This image can't be uploaded: ${data.reason}` : "This image can't be uploaded.");
  }
}
