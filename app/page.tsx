import Link from 'next/link';
import Navbar from '@/components/navbar';
import HeroSection from '@/components/hero-section';
import FeaturedProducts from '@/components/featured-products';
import Footer from '@/components/footer';
import PageTransition from '@/components/page-transition';
import AnimatedSection from '@/components/animated-section';

export default function Home() {
  return (
    <PageTransition>
      <main className="min-h-screen flex flex-col">
        {/* <Navbar /> */}
        <div className="flex-grow">
          <HeroSection />
          <AnimatedSection className="py-16 px-4 max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Extraordinary Design, Surprising Prices
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Our frames are designed in-house and handcrafted from premium
              materials, starting from just $95 including prescription lenses.
            </p>
            <FeaturedProducts />
          </AnimatedSection>

          {/* Added lifestyle images section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
              <AnimatedSection direction="up" className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-12">
                  Our Collection
                </h2>
              </AnimatedSection>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatedSection direction="left" delay={0.1}>
                  <div className="aspect-[4/5] relative overflow-hidden rounded-lg">
                    <img
                      src="https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?q=80&w=1000&auto=format&fit=crop"
                      alt="Person wearing Bailey Nelson glasses"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-6 text-white">
                        <h3 className="text-xl font-bold mb-2">
                          Optical Frames
                        </h3>
                        <Link
                          href="/glasses"
                          className="text-white underline underline-offset-4"
                        >
                          Shop Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
                <AnimatedSection direction="up" delay={0.2}>
                  <div className="aspect-[4/5] relative overflow-hidden rounded-lg">
                    <img
                      src="https://images.unsplash.com/photo-1584036553516-bf83210aa16c?q=80&w=1000&auto=format&fit=crop"
                      alt="Person wearing Bailey Nelson sunglasses"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-6 text-white">
                        <h3 className="text-xl font-bold mb-2">Sunglasses</h3>
                        <Link
                          href="/sunglasses"
                          className="text-white underline underline-offset-4"
                        >
                          Shop Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
                <AnimatedSection direction="right" delay={0.3}>
                  <div className="aspect-[4/5] relative overflow-hidden rounded-lg">
                    <img
                      src="https://images.unsplash.com/photo-1616296425622-4560a2ad2b82?q=80&w=1000&auto=format&fit=crop"
                      alt="Person getting an eye test"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-6 text-white">
                        <h3 className="text-xl font-bold mb-2">Eye Tests</h3>
                        <Link
                          href="#"
                          className="text-white underline underline-offset-4"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          {/* Added testimonials section */}
          <section className="py-16 px-4 max-w-7xl mx-auto">
            <AnimatedSection direction="up" className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-12">
                What Our Customers Say
              </h2>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AnimatedSection direction="up" delay={0.1}>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center mb-4">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
                      alt="Customer"
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className="font-medium">Sarah J.</h3>
                      <p className="text-sm text-gray-500">Sydney, Australia</p>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    "I love my new glasses! The quality is amazing and the price
                    was so reasonable. The staff was incredibly helpful in
                    finding the perfect fit for my face."
                  </p>
                </div>
              </AnimatedSection>
              <AnimatedSection direction="up" delay={0.2}>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center mb-4">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
                      alt="Customer"
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className="font-medium">Michael T.</h3>
                      <p className="text-sm text-gray-500">
                        Melbourne, Australia
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    "The eye test was thorough and professional. I ended up with
                    the perfect prescription and stylish frames that I get
                    compliments on all the time."
                  </p>
                </div>
              </AnimatedSection>
              <AnimatedSection direction="up" delay={0.3}>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center mb-4">
                    <img
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop"
                      alt="Customer"
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className="font-medium">Emma L.</h3>
                      <p className="text-sm text-gray-500">
                        Brisbane, Australia
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600">
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
