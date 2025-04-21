"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ProductDetailImagesProps {
  productId: string
  mainImage: string
  productName: string
}

export default function ProductDetailImages({ productId, mainImage, productName }: ProductDetailImagesProps) {
  // Generate additional images based on the product category
  const [additionalImages, setAdditionalImages] = useState<string[]>([mainImage])

  useEffect(() => {
    // Determine if this is glasses or sunglasses based on the product ID
    const isGlasses = Number.parseInt(productId) % 2 === 1

    // Set different detail images based on product type
    if (isGlasses) {
      setAdditionalImages([
        mainImage,
        "https://images.unsplash.com/photo-1633621641966-23836fcafd7a?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=800&auto=format&fit=crop",
        "https://images.pexels.com/photos/5752404/pexels-photo-5752404.jpeg?auto=compress&cs=tinysrgb&w=800",
      ])
    } else {
      setAdditionalImages([
        mainImage,
        "https://images.unsplash.com/photo-1625591341337-13dc6e871cee?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1577744486770-2f42d1e38f29?q=80&w=800&auto=format&fit=crop",
        "https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=800",
      ])
    }
  }, [productId, mainImage])

  const [currentImage, setCurrentImage] = useState(mainImage)
  const [activeIndex, setActiveIndex] = useState(0)

  const imageVariants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 300 : -300,
        opacity: 0,
      }
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 300 : -300,
        opacity: 0,
      }
    },
  }

  const [direction, setDirection] = useState(0)

  const handlePrevious = () => {
    setDirection(-1)
    const newIndex = activeIndex === 0 ? additionalImages.length - 1 : activeIndex - 1
    setActiveIndex(newIndex)
    setCurrentImage(additionalImages[newIndex])
  }

  const handleNext = () => {
    setDirection(1)
    const newIndex = activeIndex === additionalImages.length - 1 ? 0 : activeIndex + 1
    setActiveIndex(newIndex)
    setCurrentImage(additionalImages[newIndex])
  }

  return (
    <div className="space-y-4">
      {/* Main large image */}
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={currentImage}
            src={currentImage || "/placeholder.svg"}
            alt={productName}
            className="w-full h-full object-cover absolute inset-0"
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          />
        </AnimatePresence>
      </div>

      {/* Thumbnail navigation */}
      <div className="flex items-center space-x-2">
        <motion.button
          onClick={handlePrevious}
          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
          aria-label="Previous image"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>

        <div className="flex-1 flex space-x-2 overflow-x-auto py-1 scrollbar-hide">
          {additionalImages.map((img, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setDirection(index > activeIndex ? 1 : -1)
                setCurrentImage(img)
                setActiveIndex(index)
              }}
              className={`w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all ${
                currentImage === img ? "border-black" : "border-transparent"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={img || "/placeholder.svg"}
                alt={`${productName} view ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>

        <motion.button
          onClick={handleNext}
          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
          aria-label="Next image"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </div>
    </div>
  )
}
