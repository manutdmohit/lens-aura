import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  return (
    <main>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About Bailey Nelson</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We're on a mission to change the eyewear industry for the better.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Bailey Nelson was founded in 2012 with a simple idea: to create high-quality, thoughtfully designed
              eyewear that doesn't cost a fortune.
            </p>
            <p className="text-gray-600 mb-4">
              We saw an industry that was making high margins on low-quality products, and we knew there was a better
              way. By designing our frames in-house and cutting out the middlemen, we're able to offer premium eyewear
              at prices that make sense.
            </p>
            <p className="text-gray-600">
              Today, we have stores across Australia, New Zealand, Canada, and the UK, but our mission remains the same:
              to make beautiful, affordable eyewear available to everyone.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=1000&auto=format&fit=crop"
              alt="Bailey Nelson team"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Quality Materials</h3>
            <p className="text-gray-600">
              We use premium materials like Italian acetate, German hinges, and scratch-resistant lenses in all our
              frames.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Thoughtful Design</h3>
            <p className="text-gray-600">
              Our in-house design team creates frames that are both timeless and contemporary, ensuring you'll love your
              glasses for years to come.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Fair Pricing</h3>
            <p className="text-gray-600">
              By cutting out the middlemen and selling direct, we're able to offer premium eyewear at prices that are
              fair and transparent.
            </p>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="rounded-lg overflow-hidden mb-4">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=500&auto=format&fit=crop"
                  alt="Team member"
                  className="w-full aspect-square object-cover"
                />
              </div>
              <h3 className="font-bold">James Wilson</h3>
              <p className="text-gray-600">Co-Founder & CEO</p>
            </div>
            <div>
              <div className="rounded-lg overflow-hidden mb-4">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=500&auto=format&fit=crop"
                  alt="Team member"
                  className="w-full aspect-square object-cover"
                />
              </div>
              <h3 className="font-bold">Sarah Chen</h3>
              <p className="text-gray-600">Co-Founder & Creative Director</p>
            </div>
            <div>
              <div className="rounded-lg overflow-hidden mb-4">
                <img
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=500&auto=format&fit=crop"
                  alt="Team member"
                  className="w-full aspect-square object-cover"
                />
              </div>
              <h3 className="font-bold">Michael Taylor</h3>
              <p className="text-gray-600">Head of Product</p>
            </div>
            <div>
              <div className="rounded-lg overflow-hidden mb-4">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500&auto=format&fit=crop"
                  alt="Team member"
                  className="w-full aspect-square object-cover"
                />
              </div>
              <h3 className="font-bold">Emma Johnson</h3>
              <p className="text-gray-600">Head of Retail</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            We're always looking for passionate people to join our growing team. Check out our current openings.
          </p>
          <Button asChild className="bg-black text-white hover:bg-gray-800">
            <Link href="#">View Careers</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
