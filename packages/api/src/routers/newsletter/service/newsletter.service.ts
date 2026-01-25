import { Language, db } from "@package/db"
import { NewsletterWelcome, sendEmail } from "@package/email"
import type { NewsletterSubscribeInput } from "@package/validations"

export class NewsletterService {
  public async subscribe(input: NewsletterSubscribeInput) {
    const normalizedEmail = input.email.trim().toLowerCase()
    const preferredLanguage = input.language ?? Language.en

    const updateData: {
      language: Language
      unsubscribedAt: null
      name?: string
    } = {
      language: preferredLanguage,
      unsubscribedAt: null,
    }

    if (input.name) {
      updateData.name = input.name.trim()
    }

    const createData = {
      email: normalizedEmail,
      language: preferredLanguage,
      ...(input.name ? { name: input.name.trim() } : {}),
    }

    const subscriber = await db.newsletterSubscriber.upsert({
      where: { email: normalizedEmail },
      update: updateData,
      create: createData,
    })

    const emailResponse = await sendEmail({
      email: [subscriber.email],
      subject:
        preferredLanguage === Language.es
          ? "¡Bienvenido a Alpadev!"
          : "Welcome to Alpadev!",
      react: NewsletterWelcome({
        email: subscriber.email,
        name: subscriber.name,
        language: preferredLanguage,
      }),
      from: undefined,
    })

    if ("error" in emailResponse) {
      throw new Error(JSON.stringify(emailResponse.error))
    }

    return { subscriber }
  }
}
