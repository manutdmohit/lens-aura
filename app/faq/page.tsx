'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import AnimatedSection from '@/components/animated-section';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How do I know my frame size?',
    answer:
      'You can find your frame size on your current glasses. The measurements are usually printed on the inside of the temple arm.',
  },
  {
    question: 'What is your shipping policy?',
    answer:
      'We offer free standard shipping on all orders over $60. Orders are typically processed within 1-2 business days and delivered within 3-5 business days. Express shipping options are also available.',
  },
  {
    question: 'How do I care for my glasses?',
    answer:
      'Clean your glasses regularly with a microfiber cloth and lens cleaning solution. Avoid using paper towels or clothing as they can scratch the lenses. Store your glasses in their case when not in use.',
  },
  {
    question: 'What is your warranty policy?',
    answer:
      'All our frames come with a 12-month warranty against manufacturing defects. This covers issues with materials and workmanship but does not cover normal wear and tear or accidental damage.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <AnimatedSection direction="up" delay={0.1}>
          <h1 className="text-4xl font-bold text-center mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 text-center mb-12">
            Find answers to common questions about our products and services
          </p>
        </AnimatedSection>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <AnimatedSection
              key={index}
              direction="up"
              delay={0.1 * (index + 2)}
            >
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="font-medium">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 py-4 bg-gray-50">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection
          direction="up"
          delay={0.8}
          className="mt-12 text-center"
        >
          <p className="text-gray-600">
            Still have questions? Contact our customer service team at{' '}
            <a
              href="mailto:info@lensaura.com.au"
              className="text-blue-600 hover:underline"
            >
              info@lensaura.com.au
            </a>
          </p>
        </AnimatedSection>
      </div>
    </div>
  );
}
