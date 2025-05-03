"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const brands = [
  {
    name: "Bailey Nelson",
    logo: "/placeholder.svg?height=80&width=160",
    description: "Our premium, daily, monthly & more",
    buttonText: "Shop Bailey Nelson",
    link: "/contacts/bailey-nelson",
  },
  {
    name: "ACUVUE",
    logo: "/placeholder.svg?height=80&width=160",
    description: "Oasys, Moist, Vita & more",
    buttonText: "Shop ACUVUE",
    link: "/contacts/acuvue",
  },
  {
    name: "Alcon",
    logo: "/placeholder.svg?height=80&width=160",
    description: "Dailies, Air Optix & more",
    buttonText: "Shop Alcon",
    link: "/contacts/alcon",
  },
  {
    name: "CooperVision",
    logo: "/placeholder.svg?height=80&width=160",
    description: "MyDay, Biofinity, Clariti & more",
    buttonText: "Shop CooperVision",
    link: "/contacts/coopervision",
  },
]

export default function ContactLensBrands() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {brands.map((brand, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="flex"
        >
          <Card className="w-full flex flex-col">
            <CardContent className="p-6 flex flex-col items-center text-center h-full">
              <div className="h-24 flex items-center justify-center mb-4 relative w-full">
                <Image
                  src={brand.logo || "/placeholder.svg"}
                  alt={`${brand.name} logo`}
                  width={160}
                  height={80}
                  className="max-h-full object-contain"
                  priority
                />
              </div>
              <h3 className="text-xl font-bold mb-2">{brand.name}</h3>
              <p className="text-gray-600 mb-4">{brand.description}</p>
              <div className="mt-auto w-full">
                <Button asChild className="w-full bg-black text-white hover:bg-gray-800">
                  <Link href={brand.link}>{brand.buttonText}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
