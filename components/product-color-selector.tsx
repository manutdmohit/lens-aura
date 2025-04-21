"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProductColorSelectorProps {
  productId: string
  colors: string[]
  onColorChange?: (color: string) => void
}

export default function ProductColorSelector({ productId, colors, onColorChange }: ProductColorSelectorProps) {
  const [selectedColor, setSelectedColor] = useState(colors[0])

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    if (onColorChange) {
      onColorChange(color)
    }
  }

  const getColorClass = (color: string) => {
    switch (color.toLowerCase()) {
      case "black":
        return "bg-black"
      case "tortoise":
        return "bg-amber-700"
      case "crystal":
        return "bg-gray-200"
      case "navy":
        return "bg-blue-900"
      case "green":
        return "bg-green-700"
      case "gold":
        return "bg-yellow-600"
      case "silver":
        return "bg-gray-400"
      case "red":
        return "bg-red-600"
      case "blue":
        return "bg-blue-600"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="flex space-x-3">
      {colors.map((color) => (
        <button
          key={`${productId}-${color}`}
          className={cn(
            "w-8 h-8 rounded-full border-2 transition-all",
            getColorClass(color),
            selectedColor === color ? "border-black scale-110" : "border-transparent hover:scale-105",
          )}
          onClick={() => handleColorChange(color)}
          aria-label={`Select ${color} color`}
          title={color}
        />
      ))}
    </div>
  )
}
