"use client"

import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
  isTransparent?: boolean
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  isTransparent = false,
}: ModalProps) {
  const sizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-2xl",
    full: "sm:max-w-7xl",
  }

  return (
    <Transition.Root as={Fragment} show={open}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={`relative transform overflow-hidden text-left transition-all sm:my-8 sm:w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto ${
                  isTransparent
                    ? "bg-transparent shadow-none p-0 border-none"
                    : "rounded-2xl bg-black border border-white/10 px-4 pb-4 pt-5 shadow-2xl sm:p-0"
                }`}
              >
                <div className="absolute right-0 top-0 pr-6 pt-6 z-20">
                  <button
                    className="rounded-full p-2 bg-white/10 hover:bg-white/20 text-white/50 hover:text-white backdrop-blur-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-95 shadow-lg"
                    type="button"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon aria-hidden="true" className="h-6 w-6 md:h-7 md:w-7" />
                  </button>
                </div>
                {title && (
                  <div className="px-6 pt-6 pb-2">
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-semibold leading-6 text-white"
                    >
                      {title}
                    </Dialog.Title>
                  </div>
                )}
                <div>{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
