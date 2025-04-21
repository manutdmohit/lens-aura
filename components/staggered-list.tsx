"use client"

import React from "react"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { staggerContainer, fadeInUp } from "@/lib/animation"

interface StaggeredListProps {
  children: ReactNode
  className?: string
  itemClassName?: string
  threshold?: number
}

export default function StaggeredList({
  children,
  className = "",
  itemClassName = "",
  threshold = 0.1,
}: StaggeredListProps) {
  const { ref, isInView } = useScrollAnimation(threshold)

  // Convert children to array to map over them
  const childrenArray = React.Children.toArray(children)

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {childrenArray.map((child, index) => (
        <motion.div key={index} variants={fadeInUp} className={itemClassName}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
