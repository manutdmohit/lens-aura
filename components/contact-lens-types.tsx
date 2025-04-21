"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

const lensTypes = [
  {
    title: "Daily Disposable",
    description: "Fresh lenses every day. No cleaning required. Ideal for occasional wear and those with allergies.",
    image: "https://images.unsplash.com/photo-1616296425622-4560a2ad2b82?q=80&w=300&auto=format&fit=crop",
    features: ["Convenient", "Hygienic", "Low maintenance", "Great for travel"],
  },
  {
    title: "Bi-weekly",
    description: "Replace every two weeks. Balance of convenience and cost-effectiveness.",
    image: "https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?q=80&w=300&auto=format&fit=crop",
    features: ["Cost-effective", "Durable", "Comfortable", "Good for regular wear"],
  },
  {
    title: "Monthly",
    description: "Replace once a month. Economical option for full-time wearers.",
    image: "https://images.unsplash.com/photo-1584036553516-bf83210aa16c?q=80&w=300&auto=format&fit=crop",
    features: ["Most economical", "Highly durable", "Extended wear options", "Full-time use"],
  },
  {
    title: "Specialty",
    description: "Designed for specific conditions like astigmatism, presbyopia, or dry eyes.",
    image: "https://images.unsplash.com/photo-1616296425622-4560a2ad2b82?q=80&w=300&auto=format&fit=crop",
    features: ["Toric for astigmatism", "Multifocal for presbyopia", "Enhanced comfort for dry eyes"],
  },
]

export default function ContactLensTypes() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {lensTypes.map((type, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="h-full">
            <div className="aspect-square overflow-hidden">
              <img src={type.image || "/placeholder.svg"} alt={type.title} className="w-full h-full object-cover" />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">{type.title}</h3>
              <p className="text-gray-600 mb-4">{type.description}</p>
              <div className="space-y-1">
                {type.features.map((feature, i) => (
                  <p key={i} className="text-sm flex items-center">
                    <span className="text-black mr-2">•</span>
                    {feature}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
