import { Resend } from "resend"

// Added default value to avoid build error on marketing page asking us to pass a value to the constructor
export const resend = new Resend(process.env.RESEND_KEY ?? "RESEND")
