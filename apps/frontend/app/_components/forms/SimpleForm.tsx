"use client"

import React, { useState } from "react"
import {
  Input,
  Autocomplete,
  AutocompleteItem,
  Button,
  Textarea,
} from "@heroui/react"
import { cn } from "@heroui/react"
import confetti from "canvas-confetti"

import { api } from "@/lib/trpc/react"
import { useLanguage } from "@/contexts/LanguageContext"

export type SimpleFormProps = React.HTMLAttributes<HTMLFormElement> & {
  onSuccess?: () => void
}

// Tipos deben coincidir con los enums de Prisma
type RequestTypeEnum = "ticket" | "quote" | "other"
type RequestPriorityEnum = "low" | "medium" | "high" | "critical"

const SimpleForm = React.forwardRef<HTMLFormElement, SimpleFormProps>(
  ({ className, onSuccess, ...props }, ref) => {
    const { t, language } = useLanguage()
    const [selectedType, setSelectedType] = useState<RequestTypeEnum>("quote")
    const [selectedPriority, setSelectedPriority] =
      useState<RequestPriorityEnum>("medium")
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      phone: "",
      title: "",
      description: "",
    })
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    description: "",
  })

    const baseInputClassNames = {
      base: "group",
      inputWrapper:
        "bg-black/20 backdrop-blur-md border border-white/5 hover:bg-black/30 hover:border-white/10 group-data-[focus=true]:bg-black/40 group-data-[focus=true]:border-blue-500/50 group-data-[focus=true]:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)] h-14 rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
      input:
        "bg-transparent !text-white placeholder:text-zinc-500 text-[16px] font-normal caret-blue-500 selection:bg-blue-500/30",
      label: "text-zinc-400/80 group-data-[focus=true]:text-blue-400 font-medium tracking-wide text-xs uppercase mb-1",
    }

    const baseTextareaClassNames = {
      base: "group",
      inputWrapper:
        "bg-black/20 backdrop-blur-md border border-white/5 hover:bg-black/30 hover:border-white/10 group-data-[focus=true]:bg-black/40 group-data-[focus=true]:border-blue-500/50 group-data-[focus=true]:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)] rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
      input:
        "bg-transparent !text-white placeholder:text-zinc-500 text-[16px] font-normal caret-blue-500 selection:bg-blue-500/30",
      label: "text-zinc-400/80 group-data-[focus=true]:text-blue-400 font-medium tracking-wide text-xs uppercase mb-1",
    }

    // Memoizar arrays para que cambien con el idioma
    const requestTypes = React.useMemo(
      () => [
        {
          key: "ticket" as RequestTypeEnum,
          label: t("form.typeTicket"),
          description: t("form.typeTicketDesc"),
        },
        {
          key: "quote" as RequestTypeEnum,
          label: t("form.typeQuote"),
          description: t("form.typeQuoteDesc"),
        },
        {
          key: "other" as RequestTypeEnum,
          label: t("form.typeOther"),
          description: t("form.typeOtherDesc"),
        },
      ],
      [t, language]
    )

    const requestPriorities = React.useMemo(
      () => [
        {
          key: "low" as RequestPriorityEnum,
          label: t("form.priorityLow"),
          description: t("form.priorityLowDesc"),
        },
        {
          key: "medium" as RequestPriorityEnum,
          label: t("form.priorityMedium"),
          description: t("form.priorityMediumDesc"),
        },
        {
          key: "high" as RequestPriorityEnum,
          label: t("form.priorityHigh"),
          description: t("form.priorityHighDesc"),
        },
        {
          key: "critical" as RequestPriorityEnum,
          label: t("form.priorityCritical"),
          description: t("form.priorityCriticalDesc"),
        },
      ],
      [t, language]
    )

    const handleConfetti = () => {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#60A5FA", "#1E40AF", "#312E81"],
        ticks: 300,
        gravity: 1.2,
        scalar: 1.2,
      })
    }

    const validateField = (field: keyof typeof formData, value: string) => {
      let error = ""

      switch (field) {
        case "name":
          if (value.length < 2) error = t("form.errorNameShort")
          break
        case "email":
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

          if (!emailRegex.test(value)) error = t("form.errorEmailInvalid")
          break
        case "phone":
          if (value.length < 8) error = t("form.errorPhoneShort")
          break
        case "title":
          if (value.length < 5) error = t("form.errorSubjectShort")
          break
        case "description":
          if (value.length < 10) error = t("form.errorDescriptionShort")
          break
      }

      setErrors((prev) => ({ ...prev, [field]: error }))

      return error === ""
    }

    const createRequestMutation = api.request.createSimple.useMutation({
      onSuccess: () => {
        handleConfetti()
        // Limpiar formulario
        setFormData({
          name: "",
          email: "",
          phone: "",
          title: "",
          description: "",
        })
        setErrors({
          name: "",
          email: "",
          phone: "",
          title: "",
          description: "",
        })
        onSuccess?.()
      },
      onError: (error) => {
        console.error("Error al enviar la solicitud:", error.message)
      },
    })

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      // Validar todos los campos
      const isNameValid = validateField("name", formData.name)
      const isEmailValid = validateField("email", formData.email)
      const isPhoneValid = validateField("phone", formData.phone)
      const isTitleValid = validateField("title", formData.title)
      const isDescriptionValid = validateField(
        "description",
        formData.description
      )

      // Si algún campo no es válido, no enviar
      if (
        !isNameValid ||
        !isEmailValid ||
        !isPhoneValid ||
        !isTitleValid ||
        !isDescriptionValid
      ) {
        return
      }

      createRequestMutation.mutate({
        // Datos de usuario
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        // Datos de request
        type: selectedType,
        priority: selectedPriority,
        title: formData.title,
        description: formData.description,
      })
    }

    return (
      <div key={language} className={cn("relative px-8 pb-8 pt-20 md:px-12 md:pb-12 md:pt-22 rounded-[3rem] overflow-hidden group/form", className)}>
         {/* Ultramodern Glass Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-[50px] saturate-[120%]" />
        
        {/* Subtle inner glow/border highlight */}
        <div className="absolute inset-0 rounded-[3rem] border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.03)] pointer-events-none" />
        
        {/* Ambient colored spots behind the glass for depth */}
        <div className="absolute -top-[20%] -right-[10%] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 mb-3 tracking-tight drop-shadow-sm">
                {t("form.title")}
              </h2>
              <p className="text-[17px] text-zinc-400 font-normal leading-relaxed">{t("form.subtitle")}</p>
            </div>

            <form
              ref={ref}
              onSubmit={handleSubmit}
              {...props}
              className="space-y-7"
            >
              {/* Nombre */}
              <div className="w-full">
                <Input
                  classNames={baseInputClassNames}
                  errorMessage={errors.name}
                  id="name"
                  isInvalid={!!errors.name}
                  label={t("form.name")}
                  labelPlacement="outside"
                  name="name"
                  placeholder={t("form.namePlaceholder")}
                  value={formData.name}
                  onValueChange={(value) => {
                    setFormData({ ...formData, name: value })
                    if (value.length > 0) validateField("name", value)
                  }}
                />
              </div>

              {/* Email y Teléfono */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full">
                  <Input
                    classNames={baseInputClassNames}
                    errorMessage={errors.email}
                    id="email"
                    isInvalid={!!errors.email}
                    label={t("form.email")}
                    labelPlacement="outside"
                    name="email"
                    placeholder={t("form.emailPlaceholder")}
                    type="email"
                    value={formData.email}
                    onValueChange={(value) => {
                      setFormData({ ...formData, email: value })
                      if (value.length > 0) validateField("email", value)
                    }}
                  />
                </div>

                <div className="w-full">
                  <Input
                    classNames={baseInputClassNames}
                    errorMessage={errors.phone}
                    id="phone"
                    isInvalid={!!errors.phone}
                    label={t("form.phone")}
                    labelPlacement="outside"
                    name="phone"
                    placeholder={t("form.phonePlaceholder")}
                    type="tel"
                    value={formData.phone}
                    onValueChange={(value) => {
                      setFormData({ ...formData, phone: value })
                      if (value.length > 0) validateField("phone", value)
                    }}
                  />
                </div>
              </div>

              {/* Tipo y Prioridad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full">
                  <Autocomplete
                    classNames={{
                      base: "group",
                      listboxWrapper: "max-h-[300px] bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]",
                      selectorButton: "text-zinc-500 group-hover:text-white transition-colors",
                      popoverContent: "bg-transparent border-none shadow-none p-0",
                    }}
                    defaultItems={requestTypes}
                    defaultSelectedKey="quote"
                    id="type"
                    inputProps={{
                      classNames: baseInputClassNames,
                    }}
                    label={t("form.type")}
                    labelPlacement="outside"
                    placeholder={t("form.typePlaceholder")}
                    selectedKey={selectedType}
                    onSelectionChange={(key) =>
                      setSelectedType(key as RequestTypeEnum)
                    }
                  >
                    {(item) => (
                      <AutocompleteItem
                         key={item.key}
                        className="text-zinc-300 data-[hover=true]:bg-white/10 data-[hover=true]:text-white rounded-xl py-3 px-4 transition-colors duration-200"
                        textValue={item.label}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[15px] font-medium leading-none">
                            {item.label}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {item.description}
                          </span>
                        </div>
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                </div>

                <div className="w-full">
                  <Autocomplete
                    classNames={{
                       base: "group",
                      listboxWrapper: "max-h-[300px] bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]",
                      selectorButton: "text-zinc-500 group-hover:text-white transition-colors",
                      popoverContent: "bg-transparent border-none shadow-none p-0",
                    }}
                    defaultItems={requestPriorities}
                    defaultSelectedKey="medium"
                    id="priority"
                    inputProps={{
                      classNames: baseInputClassNames,
                    }}
                    label={t("form.priority")}
                    labelPlacement="outside"
                    placeholder={t("form.priorityPlaceholder")}
                    selectedKey={selectedPriority}
                    onSelectionChange={(key) =>
                      setSelectedPriority(key as RequestPriorityEnum)
                    }
                  >
                    {(item) => (
                      <AutocompleteItem
                        key={item.key}
                        className="text-zinc-300 data-[hover=true]:bg-white/10 data-[hover=true]:text-white rounded-xl py-3 px-4 transition-colors duration-200"
                        textValue={item.label}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[15px] font-medium leading-none">
                            {item.label}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {item.description}
                          </span>
                        </div>
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                </div>
              </div>

              {/* Asunto */}
              <div className="w-full">
                <Input
                  classNames={baseInputClassNames}
                  errorMessage={errors.title}
                  id="title"
                  isInvalid={!!errors.title}
                  label={t("form.subject")}
                  labelPlacement="outside"
                  name="title"
                  placeholder={t("form.subjectPlaceholder")}
                  value={formData.title}
                  onValueChange={(value) => {
                    setFormData({ ...formData, title: value })
                    if (value.length > 0) validateField("title", value)
                  }}
                />
              </div>

              {/* Descripción */}
              <div className="w-full">
                <Textarea
                  classNames={baseTextareaClassNames}
                  errorMessage={errors.description}
                  id="description"
                  isInvalid={!!errors.description}
                  label={t("form.description")}
                  labelPlacement="outside"
                  minRows={4}
                  name="description"
                  placeholder={t("form.descriptionPlaceholder")}
                  value={formData.description}
                  onValueChange={(value) => {
                    setFormData({ ...formData, description: value })
                    if (value.length > 0) validateField("description", value)
                  }}
                />
              </div>

              {/* Botón de envío */}
              <div className="w-full pt-6">
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold tracking-wide shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.6)] transition-all duration-300 text-[16px] h-14 rounded-2xl active:scale-[0.98] border border-white/10"
                  isLoading={createRequestMutation.isPending}
                  size="lg"
                  type="submit"
                >
                  {createRequestMutation.isPending
                    ? t("form.submitting")
                    : t("form.submit")}
                </Button>
              </div>
            </form>
        </div>
      </div>
    )
  }
)

SimpleForm.displayName = "SimpleForm"

export default SimpleForm
