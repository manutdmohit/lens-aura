"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Calendar, Clock, Sun, Moon, Star } from "lucide-react"

const lensTypes = [
  {
    title: "Daily Disposable",
    description: "Perfect for occasional wear and those with allergies. Discard after each use for maximum hygiene.",
    icon: Eye,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50",
    features: [
      "No cleaning required",
      "Ideal for allergies",
      "Perfect for occasional wear",
      "Maximum hygiene"
    ]
  },
  {
    title: "Weekly",
    description: "A great balance of convenience and cost-effectiveness. Replace every week for optimal comfort.",
    icon: Calendar,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-50",
    features: [
      "Weekly replacement",
      "Cost-effective",
      "Good for regular wear",
      "Easy maintenance"
    ]
  },
  {
    title: "Bi-weekly",
    description: "Replace every two weeks. A popular choice for regular wearers seeking comfort and value.",
    icon: Clock,
    iconColor: "text-green-500",
    bgColor: "bg-green-50",
    features: [
      "Two-week replacement",
      "Balanced cost",
      "Comfortable wear",
      "Regular maintenance"
    ]
  },
  {
    title: "Monthly",
    description: "Replace monthly. Ideal for daily wearers looking for a cost-effective long-term solution.",
    icon: Sun,
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50",
    features: [
      "Monthly replacement",
      "Cost-effective",
      "Daily wear suitable",
      "Regular cleaning"
    ]
  },
  {
    title: "Quarterly",
    description: "Long-lasting lenses for stable prescriptions. Replace every three months with proper care.",
    icon: Moon,
    iconColor: "text-indigo-500",
    bgColor: "bg-indigo-50",
    features: [
      "Three-month replacement",
      "Stable prescriptions",
      "Cost-effective long-term",
      "Careful maintenance"
    ]
  },
  {
    title: "Yearly",
    description: "Traditional lenses requiring careful maintenance. Replace annually with proper care.",
    icon: Star,
    iconColor: "text-rose-500",
    bgColor: "bg-rose-50",
    features: [
      "Annual replacement",
      "Traditional option",
      "Careful maintenance",
      "Regular check-ups"
    ]
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export default function ContactLensTypes() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
    >
      {lensTypes.map((type, index) => (
        <motion.div key={index} variants={cardVariants}>
          <Card className="h-full overflow-hidden border-2 hover:border-black/10 transition-colors duration-200">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-3 rounded-full ${type.bgColor}`}>
                  <type.icon className={`h-6 w-6 ${type.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{type.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{type.description}</p>
                <ul className="space-y-2 text-left w-full">
                  {type.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <span className={`${type.iconColor} mr-2`}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
