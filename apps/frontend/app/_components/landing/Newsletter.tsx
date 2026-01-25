"use client"

import { useState, type FormEvent } from "react"
import { CalendarDaysIcon, HandRaisedIcon } from '@heroicons/react/24/outline'

import { useLanguage } from "@/contexts/LanguageContext"
import { api } from "@/lib/trpc/react"

const feedbackCopy = {
  en: {
    success: "You're in! Check your inbox for a welcome email.",
    error: "We couldn't subscribe you right now. Please try again in a moment.",
  },
  es: {
    success: "¡Listo! Revisa tu correo para ver el mensaje de bienvenida.",
    error: "No pudimos procesar tu suscripción. Inténtalo nuevamente en unos minutos.",
  },
} as const

export default function Newsletter() {
  const { t, language } = useLanguage()
  const [email, setEmail] = useState("")
  const [feedback, setFeedback] = useState<null | { type: "success" | "error"; message: string }>(null)

  const subscribeMutation = api.newsletter.subscribe.useMutation({
    onSuccess: () => {
      setFeedback({ type: "success", message: feedbackCopy[language].success })
      setEmail("")
    },
    onError: () => {
      setFeedback({ type: "error", message: feedbackCopy[language].error })
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim()) {
      setFeedback({
        type: "error",
        message:
          language === "es"
            ? "Por favor ingresa un correo válido."
            : "Please enter a valid email.",
      })
      return
    }

    subscribeMutation.mutate({
      email: email.trim(),
      language,
    })
  }

  return (
    <div className="relative isolate overflow-hidden bg-black py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
          <div className="max-w-xl lg:max-w-lg">
            <h2 className="text-4xl font-semibold tracking-tight text-white">{t("newsletter.title")}</h2>
            <p className="mt-4 text-lg text-gray-300">
              {t("newsletter.description")}
            </p>
            <form className="mt-6 max-w-md" onSubmit={handleSubmit}>
              <div className="flex gap-x-4">
                <label htmlFor="newsletter-email" className="sr-only">
                  {t("newsletter.emailLabel")}
                </label>
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (feedback) {
                      setFeedback(null)
                    }
                  }}
                  placeholder={t("newsletter.emailPlaceholder")}
                  autoComplete="email"
                  className="min-w-0 flex-auto rounded-md bg-white/5 px-3.5 py-2 text-base !text-white caret-white selection:bg-white/20 outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  disabled={subscribeMutation.isPending}
                />
                <button
                  type="submit"
                  className="flex-none rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
                  disabled={subscribeMutation.isPending}
                >
                  {subscribeMutation.isPending
                    ? language === "es"
                      ? "Enviando..."
                      : "Sending..."
                    : t("newsletter.subscribe")}
                </button>
              </div>
              {feedback ? (
                <p
                  className={`mt-3 text-sm ${
                    feedback.type === "success" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {feedback.message}
                </p>
              ) : null}
            </form>
          </div>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:pt-2">
            <div className="flex flex-col items-start">
              <div className="rounded-md bg-white/5 p-2 ring-1 ring-white/10">
                <CalendarDaysIcon aria-hidden="true" className="size-6 text-white" />
              </div>
              <dt className="mt-4 text-base font-semibold text-white">{t("newsletter.feature1.title")}</dt>
              <dd className="mt-2 text-base/7 text-gray-400">
                {t("newsletter.feature1.description")}
              </dd>
            </div>
            <div className="flex flex-col items-start">
              <div className="rounded-md bg-white/5 p-2 ring-1 ring-white/10">
                <HandRaisedIcon aria-hidden="true" className="size-6 text-white" />
              </div>
              <dt className="mt-4 text-base font-semibold text-white">{t("newsletter.feature2.title")}</dt>
              <dd className="mt-2 text-base/7 text-gray-400">
                {t("newsletter.feature2.description")}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl">
        <div
          className="relative left-1/2 top-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 -translate-y-1/2 rotate-[30deg] opacity-30 animate-gradient-xy sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(94.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            background: "linear-gradient(-45deg, #6366f1, #8b5cf6, #3b82f6, #06b6d4, #6366f1, #8b5cf6)",
            backgroundSize: "400% 400%",
          }}
        />
      </div>

      {/* Bottom scroll shadow effect */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900/80 to-transparent pointer-events-none"></div>
    </div>
  )
}
