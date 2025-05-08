import ContactLensHero from '@/components/contact-lens-hero';
import ContactLensTypes from '@/components/contact-lens-types';
import ContactLensCare from '@/components/contact-lens-care';
import ContactLensBrands from '@/components/contact-lens-brands';
import ContactLensProducts from '@/components/contact-lens-products';
import ContactForm from '@/components/contact-form';
import PageTransition from '@/components/page-transition';
import AnimatedSection from '@/components/animated-section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I know which contact lenses are right for me?",
    answer: "The best way to determine the right contact lenses for you is to schedule an eye examination with one of our optometrists. They will assess your vision needs, eye health, and lifestyle to recommend the most suitable options."
  },
  {
    question: "Can I sleep in my contact lenses?",
    answer: "Some contact lenses are approved for extended wear, including while sleeping, but this increases the risk of eye infections. We generally recommend removing your contact lenses before sleeping, even if they are extended wear lenses."
  },
  {
    question: "How often should I replace my contact lenses?",
    answer: "Replacement schedules vary depending on the type of lenses. Daily disposables should be discarded after each use, bi-weekly lenses every two weeks, and monthly lenses every month. Always follow the replacement schedule recommended by your eye care professional."
  },
  {
    question: "Can I wear contact lenses if I have astigmatism?",
    answer: "Yes, toric contact lenses are specifically designed for people with astigmatism. These lenses have different powers in different meridians of the lens to correct the uneven curvature of the eye that causes astigmatism."
  },
  {
    question: "Do you offer colored contact lenses?",
    answer: "Yes, we offer a variety of colored contact lenses that can enhance your natural eye color or completely change it. These are available with or without vision correction. All colored contacts require a prescription, even if they're just for cosmetic purposes."
  }
];

export default function ContactsPage() {
  return (
    <PageTransition>
      <main className="flex flex-col min-h-screen">
        <div className="flex-grow">
          {/* Hero Section */}
          <ContactLensHero />

          {/* Types of Contact Lenses */}
          <AnimatedSection className="py-16 px-4 max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Types of Contact Lenses
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Contact lenses come in various types to suit different needs and
              lifestyles. Explore our range to find the perfect fit for you.
            </p>
            <ContactLensTypes />
          </AnimatedSection>

          {/* Contact Lens Care */}
          <AnimatedSection
            direction="up"
            className="py-16 px-4 max-w-7xl mx-auto bg-gray-50"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Contact Lens Care
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Proper care and maintenance of your contact lenses is essential
              for eye health and comfort. Follow these guidelines to keep your
              lenses clean and your eyes healthy.
            </p>
            <ContactLensCare />
          </AnimatedSection>

          {/* Our Brands
          <AnimatedSection className="py-16 px-4 max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Our Contact Lens Brands
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              We offer a wide selection of premium contact lens brands to ensure
              you find the perfect match for your vision needs and lifestyle.
            </p>
            <ContactLensBrands />
          </AnimatedSection> */}

          {/* Featured Products */}
          <AnimatedSection
            direction="up"
            className="py-16 px-4 max-w-7xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Featured Contact Lenses
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Browse our selection of popular contact lenses, available for
              purchase online or in-store.
            </p>
            <ContactLensProducts />
          </AnimatedSection>

          {/* Benefits and Risks */}
          <AnimatedSection
            direction="up"
            className="py-16 px-4 max-w-7xl mx-auto bg-gray-50"
          >
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
                Benefits and Considerations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold mb-4">
                    Benefits of Contact Lenses
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-green-500 font-bold mr-2">✓</span>
                      <span>
                        Natural field of vision without frame obstruction
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 font-bold mr-2">✓</span>
                      <span>Freedom for active lifestyles and sports</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 font-bold mr-2">✓</span>
                      <span>No fogging up in cold weather or with masks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 font-bold mr-2">✓</span>
                      <span>Can change your eye color with colored lenses</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 font-bold mr-2">✓</span>
                      <span>UV protection options available</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold mb-4">
                    Important Considerations
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-amber-500 font-bold mr-2">!</span>
                      <span>Requires proper cleaning and maintenance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 font-bold mr-2">!</span>
                      <span>Not suitable for all eye conditions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 font-bold mr-2">!</span>
                      <span>
                        Increased risk of eye infections if not properly cared
                        for
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 font-bold mr-2">!</span>
                      <span>
                        May cause dryness or discomfort for some wearers
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 font-bold mr-2">!</span>
                      <span>Requires regular eye check-ups</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </AnimatedSection>


          {/* FAQs */}
          <AnimatedSection
            direction="up"
            className="py-16 px-4 max-w-7xl mx-auto bg-gray-50"
          >
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-none">
                    <AccordionTrigger className="text-left text-lg font-medium hover:no-underline [&[data-state=open]]:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </AnimatedSection>
        </div>
      </main>
    </PageTransition>
  );
}
