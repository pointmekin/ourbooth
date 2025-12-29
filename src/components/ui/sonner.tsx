"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-neutral-950 group-[.toaster]:text-neutral-50 group-[.toaster]:border-neutral-800 group-[.toaster]:shadow-lg font-sans",
          description: "group-[.toast]:text-neutral-400",
          actionButton:
            "group-[.toast]:bg-rose-500 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-neutral-800 group-[.toast]:text-neutral-400",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
