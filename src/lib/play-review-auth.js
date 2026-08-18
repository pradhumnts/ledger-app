import { indianMobileDigits } from "@/lib/supabase/phone";

export const PLAY_REVIEW_REQ_ID = "play-review";

export function playReviewCredentials() {
  const phone = indianMobileDigits(process.env.PLAY_REVIEW_PHONE || "");
  const otp = String(process.env.PLAY_REVIEW_OTP || "").replace(/\D/g, "");
  if (phone.length !== 10 || otp.length !== 6) return null;
  return { phone, otp };
}

export function isPlayReviewLogin(phone, otp) {
  const review = playReviewCredentials();
  if (!review) return false;
  if (indianMobileDigits(phone) !== review.phone) return false;
  if (otp != null && String(otp).replace(/\D/g, "") !== review.otp) {
    return false;
  }
  return true;
}
