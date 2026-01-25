import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components"

import Footer from "./components/footer"

type NewsletterWelcomeProps = {
  email: string
  name?: string | null
  language?: "en" | "es"
}

const copy = {
  en: {
    preview: "Welcome to the Alpadev newsletter",
    heading: "Thanks for joining our newsletter!",
    greeting: (name?: string | null) =>
      name ? `Hi ${name},` : "Hi there,",
    intro:
      "You're now part of our community. We'll send you curated tech insights, practical guides and updates on what we're building.",
    expectation:
      "Expect 1-2 emails per month. No spam, only content that helps you ship better products.",
    ctaLabel: "Visit alpadev.ai",
    closing:
      "If you ever want to stop receiving these emails, you can unsubscribe from any message.",
    signature: "— The Alpadev team",
    website: "https://alpadev.xyz",
  },
  es: {
    preview: "Bienvenido al newsletter de Alpadev",
    heading: "¡Gracias por unirte a nuestro newsletter!",
    greeting: (name?: string | null) =>
      name ? `Hola ${name},` : "Hola,",
    intro:
      "Ahora formas parte de nuestra comunidad. Te enviaremos contenido curado sobre tecnología, guías prácticas y novedades de nuestros proyectos.",
    expectation:
      "Recibirás 1-2 emails al mes. Nada de spam, solo contenido para ayudarte a construir mejores productos.",
    ctaLabel: "Visitar alpadev.ai",
    closing:
      "Si en algún momento quieres dejar de recibir estos correos, podrás darte de baja desde cualquier mensaje.",
    signature: "— El equipo de Alpadev",
    website: "https://alpadev.xyz",
  },
} as const

export default function NewsletterWelcome({
  email,
  name,
  language = "en",
}: NewsletterWelcomeProps) {
  const messages = copy[language] ?? copy.en

  return (
    <Html>
      <Head />
      <Preview>{messages.preview}</Preview>
      <Tailwind>
        <Body className="m-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[520px] rounded border border-solid border-gray-200 px-10 py-6">
            <Heading className="mx-0 my-6 p-0 text-xl font-semibold text-black">
              {messages.heading}
            </Heading>
            <Text className="text-sm leading-6 text-black">
              {messages.greeting(name)}
            </Text>
            <Text className="text-sm leading-6 text-black">{messages.intro}</Text>
            <Text className="text-sm leading-6 text-black">
              {messages.expectation}
            </Text>
            <Link
              className="mt-6 inline-block rounded bg-black px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white"
              href={messages.website}
            >
              {messages.ctaLabel}
            </Link>
            <Text className="mt-6 text-sm leading-6 text-black">
              {messages.closing}
            </Text>
            <Text className="text-sm font-light leading-6 text-gray-500">
              {messages.signature}
            </Text>
            <Footer email={email} marketing />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
