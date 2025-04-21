"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { hoverScale } from "@/lib/animation"

interface AnimatedButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  asChild?: boolean
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

export default function AnimatedButton({
  children,
  onClick,
  className,
  asChild = false,
  disabled = false,
  type = "button",
}: AnimatedButtonProps) {
  return (
    <motion.div whileHover={hoverScale} whileTap={{ scale: 0.98 }}>
      <Button onClick={onClick} className={className} asChild={asChild} disabled={disabled} type={type}>
        {children}
      </Button>
    </motion.div>
  )
}
