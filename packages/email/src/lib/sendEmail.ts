import { resend } from "./resend"

type EmailOptions = {
  from?: string
  email: string[]
  subject: string
  react: React.ReactElement
}

export function sendEmail(options: EmailOptions) {
  return resend.emails.send({
    from: options.from ?? `Alpadev <${process.env.RESEND_EMAIL_DOMAIN}>`,
    to: options.email,
    subject: options.subject,
    react: options.react,
  })
}
