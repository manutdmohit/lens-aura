import Link from 'next/link';
import HeroSection from '@/components/hero-section';
import FeaturedProducts from '@/components/featured-products';
import PageTransition from '@/components/page-transition';
import AnimatedSection from '@/components/animated-section';
import PriceRangeDisplay from '@/components/price-range-display';
import { Glasses, Sun, Star, Quote, ArrowRight, Eye } from 'lucide-react';
import { Playfair_Display, Montserrat } from 'next/font/google';
import Image from 'next/image';

const playfair = Playfair_Display({ subsets: ['latin'] });
const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata = {
  title: "Lens Aura | Premium Eyewear Australia",
  description: "Discover extraordinary eyewear at surprising prices. Shop glasses, sunglasses, and contact lenses online with fast shipping Australia-wide.",
  openGraph: {
    title: "Lens Aura | Premium Eyewear Australia",
    description: "Discover extraordinary eyewear at surprising prices. Shop glasses, sunglasses, and contact lenses online with fast shipping Australia-wide.",
    url: "https://lensaura.com.au/",
    siteName: "Lens Aura",
    images: [
      {
        url: "https://lensaura.com.au/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Lens Aura Eyewear",
      },
    ],
    locale: "en_AU",
    type: "website",
  },
  alternates: {
    canonical: "https://lensaura.com.au/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lens Aura | Premium Eyewear Australia",
    description: "Discover extraordinary eyewear at surprising prices. Shop glasses, sunglasses, and contact lenses online with fast shipping Australia-wide.",
    images: ["https://lensaura.com.au/og-image.jpg"],
  },
};

export default function Home() {
  return (
    <PageTransition>
      <main className={`min-h-screen flex flex-col ${montserrat.className} bg-[#F2D399]`}>
        {/* <Navbar /> */}
        <div className="flex-grow">
          <HeroSection />
          <AnimatedSection className="py-24 px-4 max-w-7xl mx-auto text-center">
            <h2 className={`${playfair.className} text-5xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-600 relative z-10 drop-shadow-sm`} style={{ textShadow: '0 0 25px rgba(242, 211, 153, 0.3)' }}>
              Extraordinary Design, Surprising Prices
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-16 leading-relaxed">
              Our frames are designed in-house and handcrafted from premium
              materials, starting from just $95 including prescription lenses.
            </p>
            <FeaturedProducts />
          </AnimatedSection>

          {/* Price Range Display */}
          <AnimatedSection className="py-12 px-4 max-w-7xl mx-auto" direction="up">
            <PriceRangeDisplay />
          </AnimatedSection>

          {/* Lifestyle images section with enhanced design */}
          <section className="mx-auto py-24 bg-gradient-to-b from-gray-50 to-[#F2D399]">
            <div className="max-w-7xl mx-auto px-4">
              <AnimatedSection direction="up" className="text-center mb-16">
                <h2 className={`${playfair.className} text-4xl md:text-5xl font-bold mb-6`}>
                  Discover Our Collection
                </h2>
                <div className="w-24 h-1 bg-teal-500 mx-auto"></div>
              </AnimatedSection>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatedSection direction="left" delay={0.1}>
                  <div className="group relative overflow-hidden rounded-2xl shadow-2xl h-[450px]">
                    <div className="absolute inset-0">
                      <Image
                        src="/images/glasses.jpg"
                        alt="Premium eyewear collection"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                        priority
                        quality={100}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="absolute inset-0 flex items-end p-8">
                      <div className="w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                            <Glasses className="w-6 h-6 text-white" />
                          </div>
                          <h3 className={`${playfair.className} text-2xl font-bold text-white`}>
                            Glasses
                          </h3>
                        </div>
                        <Link
                          href="/glasses"
                          className="inline-flex items-center text-lg font-medium text-white hover:text-amber-300 transition-colors group/link"
                        >
                          Explore Collection 
                          <ArrowRight className="ml-2 w-5 h-5 transform group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>

                <AnimatedSection direction="up" delay={0.2}>
                  <div className="group relative overflow-hidden rounded-2xl shadow-2xl h-[450px]">
                    <div className="absolute inset-0">
                      <Image
                        src="/images/sunglasses.jpg"
                        alt="Premium sunglasses collection"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain transition-all duration-700 group-hover:scale-110 group-hover:-rotate-1"
                        priority
                        quality={100}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="absolute inset-0 flex items-end p-8">
                      <div className="w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                            <Sun className="w-6 h-6 text-white" />
                          </div>
                          <h3 className={`${playfair.className} text-2xl font-bold text-white`}>
                            Sunglasses
                          </h3>
                        </div>
                        <Link
                          href="/sunglasses"
                          className="inline-flex items-center text-lg font-medium text-white hover:text-amber-300 transition-colors group/link"
                        >
                          Explore Collection 
                          <ArrowRight className="ml-2 w-5 h-5 transform group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>

                <AnimatedSection direction="right" delay={0.3}>
                  <div className="group relative overflow-hidden rounded-2xl shadow-2xl h-[450px]">
                    <div className="absolute inset-0">
                      <Image
                        src="/images/lens.jpg"
                        alt="Contact lenses collection"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                        priority
                        quality={100}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="absolute inset-0 flex items-end p-8">
                      <div className="w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                          <h3 className={`${playfair.className} text-2xl font-bold text-white`}>
                            Contact Lenses
                          </h3>
                        </div>
                        <Link
                          href="/contacts"
                          className="inline-flex items-center text-lg font-medium text-white hover:text-amber-300 transition-colors group/link"
                        >
                          Explore Collection 
                          <ArrowRight className="ml-2 w-5 h-5 transform group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          {/* Enhanced testimonials section */}
          <section className="py-24 px-4 max-w-7xl mx-auto">
            <AnimatedSection direction="up" className="text-center mb-16">
              <Star className="w-12 h-12 text-amber-400 mx-auto mb-6" />
              <h2 className={`${playfair.className} text-4xl md:text-5xl font-bold mb-6`}>
                What Our Customers Say
              </h2>
              <div className="w-24 h-1 bg-amber-400 mx-auto"></div>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AnimatedSection direction="up" delay={0.1}>
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <Quote className="w-10 h-10 text-teal-500 mb-6" />
                  <div className="flex items-center mb-6">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop"
                      alt="Customer"
                      width={400}
                      height={400}
                      className="w-16 h-16 rounded-full object-cover mr-4 ring-4 ring-amber-100"
                    />
                    <div>
                      <h3 className={`${playfair.className} text-xl font-bold`}>Sarah J.</h3>
                      <p className="text-gray-500">Sydney, Australia</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    "I love my new glasses! The quality is amazing and the price
                    was so reasonable. The staff was incredibly helpful in
                    finding the perfect fit for my face."
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection direction="up" delay={0.2}>
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <Quote className="w-10 h-10 text-teal-500 mb-6" />
                  <div className="flex items-center mb-6">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop"
                      alt="Customer"
                      width={400}
                      height={400}
                      className="w-16 h-16 rounded-full object-cover mr-4 ring-4 ring-amber-100"
                    />
                    <div>
                      <h3 className={`${playfair.className} text-xl font-bold`}>Michael T.</h3>
                      <p className="text-gray-500">Melbourne, Australia</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    "The eye test was thorough and professional. I ended up with
                    the perfect prescription and stylish frames that I get
                    compliments on all the time."
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection direction="up" delay={0.3}>
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <Quote className="w-10 h-10 text-teal-500 mb-6" />
                  <div className="flex items-center mb-6">
                    <img
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop"
                      alt="Customer"
                      width={400}
                      height={400}
                      className="w-16 h-16 rounded-full object-cover mr-4 ring-4 ring-amber-100"
                    />
                    <div>
                      <h3 className={`${playfair.className} text-xl font-bold`}>Emma L.</h3>
                      <p className="text-gray-500">Brisbane, Australia</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    "Lens Aura's sunglasses are my go-to. The polarized
                    lenses are fantastic and the styles are so much more unique
                    than what you find at other stores."
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </section>
        </div>

      
       
      </main>
    </PageTransition>
  );
}
