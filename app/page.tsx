import Link from 'next/link';
import HeroSection from '@/components/hero-section';
import FeaturedProducts from '@/components/featured-products';
import PageTransition from '@/components/page-transition';
import AnimatedSection from '@/components/animated-section';
import { Glasses, Sun, Star, Quote, ArrowRight, Eye } from 'lucide-react';
import { Playfair_Display, Montserrat } from 'next/font/google';
import Image from 'next/image';

const playfair = Playfair_Display({ subsets: ['latin'] });
const montserrat = Montserrat({ subsets: ['latin'] });

export default function Home() {
  return (
    <PageTransition>
      <main className={`min-h-screen flex flex-col ${montserrat.className}`}>
        {/* <Navbar /> */}
        <div className="flex-grow">
          <HeroSection />
          <AnimatedSection className="py-24 px-4 max-w-7xl mx-auto text-center">
            <h2 className={`${playfair.className} text-5xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-teal-500`}>
              Extraordinary Design, Surprising Prices
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-16 leading-relaxed">
              Our frames are designed in-house and handcrafted from premium
              materials, starting from just $95 including prescription lenses.
            </p>
            <FeaturedProducts />
          </AnimatedSection>

          {/* Lifestyle images section with enhanced design */}
          <section className="mx-auto py-24 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4">
              <AnimatedSection direction="up" className="text-center mb-16">
                <h2 className={`${playfair.className} text-4xl md:text-5xl font-bold mb-6`}>
                  Discover Our Collection
                </h2>
                <div className="w-24 h-1 bg-teal-500 mx-auto"></div>
              </AnimatedSection>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatedSection direction="left" delay={0.1}>
                  <div className="group aspect-[3/4] relative overflow-hidden rounded-2xl shadow-2xl">
                    <Image
                      src="https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?q=80&w=1800&auto=format&fit=crop"
                      alt="Person wearing Bailey Nelson glasses"
                      width={1800}
                      height={2400}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end transition-opacity duration-300">
                      <div className="p-8 text-white w-full">
                        <div className="flex items-center gap-3 mb-3">
                          <Glasses className="w-6 h-6" />
                          <h3 className={`${playfair.className} text-2xl font-bold`}>
                            Glasses
                          </h3>
                        </div>
                        <Link
                          href="/glasses"
                          className="inline-flex items-center text-lg font-medium text-white hover:text-amber-300 transition-colors"
                        >
                          Explore Collection <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>

                <AnimatedSection direction="up" delay={0.2}>
                  <div className="group aspect-[3/4] relative overflow-hidden rounded-2xl shadow-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1584036553516-bf83210aa16c?q=80&w=1800&auto=format&fit=crop"
                      alt="Person wearing Bailey Nelson sunglasses"
                      width={1800}
                      height={2400}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end transition-opacity duration-300">
                      <div className="p-8 text-white w-full">
                        <div className="flex items-center gap-3 mb-3">
                          <Sun className="w-6 h-6" />
                          <h3 className={`${playfair.className} text-2xl font-bold`}>
                            Sunglasses
                          </h3>
                        </div>
                        <Link
                          href="/sunglasses"
                          className="inline-flex items-center text-lg font-medium text-white hover:text-amber-300 transition-colors"
                        >
                          Explore Collection <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>

                <AnimatedSection direction="right" delay={0.3}>
                  <div className="group aspect-[3/4] relative overflow-hidden rounded-2xl shadow-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1587385789097-0197a7fbd179?q=80&w=1800&auto=format&fit=crop"
                      alt="Contact lenses"
                      width={1800}
                      height={2400}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end transition-opacity duration-300">
                      <div className="p-8 text-white w-full">
                        <div className="flex items-center gap-3 mb-3">
                          <Eye className="w-6 h-6" />
                          <h3 className={`${playfair.className} text-2xl font-bold`}>
                            Contact Lenses
                          </h3>
                        </div>
                        <Link
                          href="/contacts"
                          className="inline-flex items-center text-lg font-medium text-white hover:text-amber-300 transition-colors"
                        >
                          Explore Collection <ArrowRight className="ml-2 w-5 h-5" />
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
                    "Bailey Nelson's sunglasses are my go-to. The polarized
                    lenses are fantastic and the styles are so much more unique
                    than what you find at other stores."
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </section>
        </div>
        {/* <Footer /> */}
      </main>
    </PageTransition>
  );
}
