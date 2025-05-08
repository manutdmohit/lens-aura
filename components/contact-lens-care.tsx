"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Droplets, HandIcon as HandWash, Clock, Ban, Eye, AlertTriangle } from "lucide-react"

const careSteps = [
  {
    title: "Wash Your Hands",
    description: "Always wash and dry your hands thoroughly before handling your contact lenses.",
    icon: <HandWash className="h-6 w-6 text-blue-500" />,
    color: "bg-blue-50",
    borderColor: "border-blue-100",
  },
  {
    title: "Use Fresh Solution",
    description: "Always use fresh solution when storing lenses. Never reuse or top off old solution.",
    icon: <Droplets className="h-6 w-6 text-emerald-500" />,
    color: "bg-emerald-50",
    borderColor: "border-emerald-100",
  },
  {
    title: "Follow Wear Schedule",
    description: "Don't wear your lenses for longer than prescribed. Replace them as recommended.",
    icon: <Clock className="h-6 w-6 text-amber-500" />,
    color: "bg-amber-50",
    borderColor: "border-amber-100",
  },
  {
    title: "Avoid Water Contact",
    description: "Keep lenses away from water. Don't swim, shower, or use hot tubs while wearing lenses.",
    icon: <Ban className="h-6 w-6 text-red-500" />,
    color: "bg-red-50",
    borderColor: "border-red-100",
  },
  {
    title: "Regular Check-ups",
    description: "Visit your eye care professional regularly for check-ups, even if your eyes feel fine.",
    icon: <Eye className="h-6 w-6 text-purple-500" />,
    color: "bg-purple-50",
    borderColor: "border-purple-100",
  },
  {
    title: "Watch for Problems",
    description: "Remove lenses and consult your eye doctor if you experience redness, pain, or blurred vision.",
    icon: <AlertTriangle className="h-6 w-6 text-orange-500" />,
    color: "bg-orange-50",
    borderColor: "border-orange-100",
  },
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

export default function ContactLensCare() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
    >
      {careSteps.map((step, index) => (
        <motion.div
          key={index}
          variants={cardVariants}
          className="flex h-full"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="w-full flex flex-col overflow-hidden border-2 hover:border-black/10 transition-colors duration-200">
            <CardContent className="p-6 flex flex-col items-center text-center flex-grow space-y-4">
              <div className={`p-4 rounded-full ${step.color} border ${step.borderColor}`}>
                {step.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
