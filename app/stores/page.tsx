import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock } from "lucide-react"
import Link from "next/link"

export default function StoresPage() {
  return (
    <main>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Stores</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Visit us in-store for eye tests, style advice, and to try on our full range of frames.
          </p>
        </div>

        {/* Store Locator Hero */}
        <div className="relative rounded-xl overflow-hidden mb-16 h-[400px]">
          <img
            src="https://images.unsplash.com/photo-1582820795651-e43a10a58a2d?q=80&w=1500&auto=format&fit=crop"
            alt="Bailey Nelson store interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white p-6">
              <h2 className="text-3xl font-bold mb-4">Find Your Nearest Store</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <input
                  type="text"
                  placeholder="Enter your postcode"
                  className="px-4 py-3 rounded-md w-full sm:w-64 text-black"
                />
                <Button className="bg-white text-black hover:bg-gray-200 w-full sm:w-auto">Search</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Stores */}
        <h2 className="text-2xl font-bold mb-6">Featured Stores</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="border rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1555448248-2571daf6344b?q=80&w=500&auto=format&fit=crop"
              alt="Sydney Store"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2">Sydney - Bondi Junction</h3>
              <div className="space-y-2 text-gray-600 mb-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p>Shop 2034, Westfield Bondi Junction, 500 Oxford St, Bondi Junction NSW 2022</p>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>(02) 9388 0055</p>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>Mon-Wed, Fri: 9:30am - 6:00pm</p>
                    <p>Thu: 9:30am - 9:00pm</p>
                    <p>Sat-Sun: 10:00am - 6:00pm</p>
                  </div>
                </div>
              </div>
              <Button asChild className="w-full bg-black text-white hover:bg-gray-800">
                <Link href="#">Book an Eye Test</Link>
              </Button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1604467794349-0b74285de7e6?q=80&w=500&auto=format&fit=crop"
              alt="Melbourne Store"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2">Melbourne - CBD</h3>
              <div className="space-y-2 text-gray-600 mb-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p>Shop 16, Melbourne Central, 211 La Trobe St, Melbourne VIC 3000</p>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>(03) 9639 5835</p>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>Mon-Wed, Fri: 9:00am - 6:00pm</p>
                    <p>Thu: 9:00am - 9:00pm</p>
                    <p>Sat-Sun: 10:00am - 6:00pm</p>
                  </div>
                </div>
              </div>
              <Button asChild className="w-full bg-black text-white hover:bg-gray-800">
                <Link href="#">Book an Eye Test</Link>
              </Button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=500&auto=format&fit=crop"
              alt="Brisbane Store"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2">Brisbane - James St</h3>
              <div className="space-y-2 text-gray-600 mb-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p>Shop 4, 19 James St, Fortitude Valley QLD 4006</p>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>(07) 3252 8588</p>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>Mon-Wed, Fri: 9:00am - 5:30pm</p>
                    <p>Thu: 9:00am - 7:00pm</p>
                    <p>Sat: 9:00am - 5:00pm</p>
                    <p>Sun: 10:00am - 4:00pm</p>
                  </div>
                </div>
              </div>
              <Button asChild className="w-full bg-black text-white hover:bg-gray-800">
                <Link href="#">Book an Eye Test</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* All Locations */}
        <h2 className="text-2xl font-bold mb-6">All Locations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="border rounded-lg p-6">
            <h3 className="font-bold text-xl mb-4">New South Wales</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Sydney - Bondi Junction</li>
              <li>Sydney - CBD</li>
              <li>Sydney - Newtown</li>
              <li>Sydney - Paddington</li>
              <li>Newcastle</li>
              <li>Byron Bay</li>
            </ul>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="font-bold text-xl mb-4">Victoria</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Melbourne - CBD</li>
              <li>Melbourne - Fitzroy</li>
              <li>Melbourne - South Yarra</li>
              <li>Geelong</li>
            </ul>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="font-bold text-xl mb-4">Queensland</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Brisbane - James St</li>
              <li>Brisbane - CBD</li>
              <li>Gold Coast - Pacific Fair</li>
              <li>Sunshine Coast</li>
            </ul>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="font-bold text-xl mb-4">Western Australia</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Perth - CBD</li>
              <li>Perth - Fremantle</li>
            </ul>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="font-bold text-xl mb-4">South Australia</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Adelaide - Rundle Mall</li>
            </ul>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="font-bold text-xl mb-4">ACT</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Canberra - Civic</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
