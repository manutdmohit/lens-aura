"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Droplets, HandIcon as HandWash, Clock, Ban, Eye, AlertTriangle } from "lucide-react"

const careSteps = [
  {
    title: "Wash Your Hands",
    description: "Always wash and dry your hands thoroughly before handling your contact lenses.",
    icon: <HandWash className="h-8 w-8 text-blue-500" />,
  },
  {
    title: "Use Fresh Solution",
    description: "Always use fresh solution when storing lenses. Never reuse or top off old solution.",
    icon: <Droplets className="h-8 w-8 text-blue-500" />,
  },
  {
    title: "Follow Wear Schedule",
    description: "Don't wear your lenses for longer than prescribed. Replace them as recommended.",
    icon: <Clock className="h-8 w-8 text-blue-500" />,
  },
  {
    title: "Avoid Water Contact",
    description: "Keep lenses away from water. Don't swim, shower, or use hot tubs while wearing lenses.",
    icon: <Ban className="h-8 w-8 text-blue-500" />,
  },
  {
    title: "Regular Check-ups",
    description: "Visit your eye care professional regularly for check-ups, even if your eyes feel fine.",
    icon: <Eye className="h-8 w-8 text-blue-500" />,
  },
  {
    title: "Watch for Problems",
    description: "Remove lenses and consult your eye doctor if you experience redness, pain, or blurred vision.",
    icon: <AlertTriangle className="h-8 w-8 text-blue-500" />,
  },
]

export default function ContactLensCare() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {careSteps.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="mb-4 p-3 bg-blue-50 rounded-full">{step.icon}</div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
