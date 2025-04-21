"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { fadeIn, fadeInUp, fadeInDown, fadeInLeft, fadeInRight } from "@/lib/animation"

type AnimationDirection = "up" | "down" | "left" | "right" | "fade" | "none"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  direction?: AnimationDirection
  delay?: number
  threshold?: number
}

export default function AnimatedSection({
  children,
  className = "",
  direction = "up",
  delay = 0,
  threshold = 0.1,
}: AnimatedSectionProps) {
  const { ref, isInView } = useScrollAnimation(threshold)

  const getVariants = () => {
    switch (direction) {
      case "up":
        return fadeInUp
      case "down":
        return fadeInDown
      case "left":
        return fadeInLeft
      case "right":
        return fadeInRight
      case "fade":
        return fadeIn
      case "none":
        return {}
      default:
        return fadeInUp
    }
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={getVariants()}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
