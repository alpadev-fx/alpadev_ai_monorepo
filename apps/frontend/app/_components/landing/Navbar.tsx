"use client"

import type { NavbarProps } from "@heroui/react"

import React from "react"
import NextLink from "next/link"
import Image from "next/image"
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Link,
  Button,
} from "@heroui/react"
import { cn } from "@heroui/react"

import Modal from "../ui/Modal"
import SimpleForm from "../forms/SimpleForm"

import LanguageToggle from "./LanguageToggle"

import { useLanguage } from "@/contexts/LanguageContext"
import { getAssetUrl } from "@/lib/r2"

export default function Component(props: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [formType, setFormType] = React.useState<"contact" | "trial">("contact")
  const { t, language } = useLanguage()

  const menuItems = React.useMemo(
    () => [
      { name: t("nav.home"), href: "/" },
      { name: t("nav.services"), href: "#features" },
      { name: t("nav.plans"), href: "#pricing" },
      { name: t("nav.faq"), href: "#faq" },
      { name: t("nav.blog"), href: "/blog" },
      { name: t("nav.testimonials"), href: "#testimonios" },
    ],
    [language, t]
  )

  return (
    <Navbar
      {...props}
      // @ts-expect-error TS2590 — HeroUI Navbar slot union exceeds TS union-complexity budget
      classNames={{
        base: cn("bg-black", {
          "bg-black": isMenuOpen,
        }),
        wrapper: "w-full justify-between md:justify-center",
        item: "hidden md:flex",
      }}
      height="80px"
      isMenuOpen={isMenuOpen}
      maxWidth="xl"
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarMenuToggle className="text-gray-300 md:hidden" />

      <NavbarBrand
        as={NextLink}
        className="cursor-pointer absolute right-4 md:relative md:right-auto flex-grow-0 md:flex-grow"
        href="/"
      >
        <Image
          alt="Logo"
          className="h-[80px] w-auto"
          height={80}
          src={getAssetUrl("logo.jpg")}
          width={80}
          priority
        />
      </NavbarBrand>
      <NavbarContent
        className="shadow-medium hidden h-11 gap-4 rounded-full px-4 backdrop-blur-md backdrop-saturate-150 md:flex"
        justify="center"
      >
        <NavbarItem>
          <Link className="text-gray-300 hover:text-white" href="/" size="sm">
            {t("nav.home")}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            className="text-gray-300 hover:text-white"
            href="#features"
            size="sm"
          >
            {t("nav.services")}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            className="text-gray-300 hover:text-white"
            href="#pricing"
            size="sm"
          >
            {t("nav.plans")}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            className="text-gray-300 hover:text-white"
            href="#faq"
            size="sm"
          >
            {t("nav.faq")}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            className="text-gray-300 hover:text-white"
            href="/blog"
            size="sm"
          >
            {t("nav.blog")}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            className="text-gray-300 hover:text-white"
            href="#testimonios"
            size="sm"
          >
            {t("nav.testimonials")}
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <LanguageToggle />
        </NavbarItem>
        <NavbarItem className="ml-2">
          <Button
            className="bg-gray-800 text-gray-200 hover:bg-gray-700"
            radius="full"
            variant="light"
            onPress={() => {
              setFormType("contact")
              setIsModalOpen(true)
            }}
          >
            {t("nav.contact")}
          </Button>
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu
        className="bg-black shadow-medium top-[calc(var(--navbar-height)-1px)] max-h-[70vh] pt-6 pb-6 backdrop-blur-md backdrop-saturate-150 overflow-y-auto border-t border-gray-800"
        motionProps={{
          initial: { opacity: 0, y: -20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
          transition: {
            ease: "easeInOut",
            duration: 0.2,
          },
        }}
      >
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`} className="px-4">
            <Link
              className="text-gray-300 hover:text-white w-full text-lg py-3 block border-b border-gray-800 last:border-b-0"
              href={item.href}
              size="lg"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        <div className="px-4 mt-6 space-y-3">
          <div className="flex justify-center mb-4">
            <LanguageToggle />
          </div>
          <Button
            className="w-full bg-gray-800 text-gray-200 hover:bg-gray-700"
            radius="full"
            size="lg"
            variant="light"
            onPress={() => {
              setFormType("contact")
              setIsModalOpen(true)
              setIsMenuOpen(false)
            }}
          >
            {t("nav.contact")}
          </Button>
        </div>
      </NavbarMenu>

      {/* Modal para formulario */}
      <Modal
        isTransparent={formType === "contact"}
        open={isModalOpen}
        size="xl"
        title={formType === "contact" ? undefined : t("hero.cta.primary")}
        onClose={() => setIsModalOpen(false)}
      >
        <SimpleForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </Navbar>
  )
}
