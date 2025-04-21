"use client"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

interface CategoryLink {
  title: string
  href: string
  image?: string
  description?: string
}

interface MegaMenuProps {
  title: string
  mainLink: string
  featuredLinks: CategoryLink[]
  additionalLinks: CategoryLink[]
  isActive: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function MegaMenu({
  title,
  mainLink,
  featuredLinks,
  additionalLinks,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: MegaMenuProps) {
  return (
    <div className="h-full" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <Link
        href={mainLink}
        className={`flex items-center h-full px-4 text-base ${
          isActive ? "text-black font-medium" : "text-gray-700 hover:text-black"
        }`}
      >
        <span>{title}</span>
        <ChevronDown
          className={`ml-1 h-4 w-4 transition-transform ${isActive ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </Link>

      {/* The mega menu is now positioned in the parent Navbar component */}
    </div>
  )
}
