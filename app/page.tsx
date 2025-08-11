import Link from 'next/link';
import HeroSection from '@/components/hero-section';
import FeaturedProducts from '@/components/featured-products';
import PageTransition from '@/components/page-transition';
import AnimatedSection from '@/components/animated-section';
import PriceRangeDisplay from '@/components/price-range-display';
import { Glasses, Sun, ArrowRight, Eye } from 'lucide-react';
import { Playfair_Display, Montserrat } from 'next/font/google';
import Image from 'next/image';

const playfair = Playfair_Display({ subsets: ['latin'] });
const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata = {
  title: 'Lens Aura | Premium Eyewear Australia',
  description:
    'Discover extraordinary eyewear at surprising prices. Shop glasses, sunglasses, and contact lenses online with fast shipping Australia-wide.',
  openGraph: {
    title: 'Lens Aura | Premium Eyewear Australia',
    description:
      'Discover extraordinary eyewear at surprising prices. Shop glasses, sunglasses, and contact lenses online with fast shipping Australia-wide.',
    url: 'https://lensaura.com.au/',
    siteName: 'Lens Aura',
    images: [
      {
        url: 'https://lensaura.com.au/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Lens Aura Eyewear',
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },
  alternates: {
    canonical: 'https://lensaura.com.au/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lens Aura | Premium Eyewear Australia',
    description:
      'Discover extraordinary eyewear at surprising prices. Shop glasses, sunglasses, and contact lenses online with fast shipping Australia-wide.',
    images: ['https://lensaura.com.au/og-image.jpg'],
  },
};

export default function Home() {
  return (
    <PageTransition>
      <div
        className={`flex flex-col ${montserrat.className} bg-gradient-to-br from-slate-50 via-white to-blue-50/30`}
      >
        <div className="flex-grow">
          <HeroSection />

          {/* Extraordinary Design, Surprising Prices, Featured Products */}
          <AnimatedSection className="py-24 px-4 max-w-7xl mx-auto text-center">
            <h2
              className={`${playfair.className} text-5xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-600 relative z-10 drop-shadow-sm`}
              style={{ textShadow: '0 0 25px rgba(242, 211, 153, 0.3)' }}
            >
              Extraordinary Design, Surprising Prices
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-16 leading-relaxed">
              Our sunglasses feature signature materials, polarized lenses, and
              UV protection at surprising prices.
            </p>
            <FeaturedProducts />
          </AnimatedSection>

          {/* Price Range Display, Featured Products */}
          <AnimatedSection
            className="py-12 px-4 max-w-7xl mx-auto"
            direction="up"
          >
            <PriceRangeDisplay />
          </AnimatedSection>

          {/* Lifestyle images section with enhanced design */}
          <section className="mx-auto py-24 bg-gradient-to-b from-gray-50 to-slate-100">
            <div className="max-w-7xl mx-auto px-4">
              <AnimatedSection direction="up" className="text-center mb-16">
                <h2
                  className={`${playfair.className} text-4xl md:text-5xl font-bold mb-6`}
                >
                  Discover Our Collection
                </h2>
                <div className="w-24 h-1 bg-teal-500 mx-auto"></div>
              </AnimatedSection>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <AnimatedSection direction="left" delay={0.1}>
                  <div className="group relative overflow-hidden rounded-2xl shadow-2xl h-[450px]">
                    <div className="absolute inset-0">
                      <Image
                        src="/images/sunglasses.jpg"
                        alt="Signature sunglasses collection"
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
                          <h3
                            className={`${playfair.className} text-2xl font-bold text-white`}
                          >
                            Signature Sunglasses
                          </h3>
                        </div>
                        <p className="text-white/80 mb-4 text-sm leading-relaxed">
                          Luxury designer frames with signature polarized lenses
                          and UV protection
                        </p>
                        <Link
                          href="/sunglasses"
                          className="inline-flex items-center text-lg font-medium text-white hover:text-amber-300 transition-colors group/link"
                        >
                          Explore Signature Collection
                          <ArrowRight className="ml-2 w-5 h-5 transform group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>

                <AnimatedSection direction="right" delay={0.2}>
                  <div className="group relative overflow-hidden rounded-2xl shadow-2xl h-[450px]">
                    <div className="absolute inset-0">
                      <Image
                        src="/images/sunglasses.jpg"
                        alt="Essentials sunglasses collection"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                        priority
                        quality={100}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="absolute inset-0 flex items-end p-8">
                      <div className="w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                            <Sun className="w-6 h-6 text-white" />
                          </div>
                          <h3
                            className={`${playfair.className} text-2xl font-bold text-white`}
                          >
                            Essentials Sunglasses
                          </h3>
                        </div>
                        <p className="text-white/80 mb-4 text-sm leading-relaxed">
                          Quality everyday sunglasses with excellent UV
                          protection at affordable prices
                        </p>
                        <Link
                          href="/sunglasses"
                          className="inline-flex items-center text-lg font-medium text-white hover:text-blue-300 transition-colors group/link"
                        >
                          Explore Essentials Collection
                          <ArrowRight className="ml-2 w-5 h-5 transform group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
