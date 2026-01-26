import { Resend } from "resend"

// Lazy initialization to prevent crash when RESEND_KEY is not set
let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_KEY;
    if (!apiKey) {
      throw new Error("RESEND_KEY environment variable is not set. Email functionality is disabled.");
    }
    _resend = new Resend(apiKey);
  }
  return _resend;
}

// For backwards compatibility - will throw on first use if RESEND_KEY is not set
export const resend = {
  get emails() {
    return getResend().emails;
  }
};
