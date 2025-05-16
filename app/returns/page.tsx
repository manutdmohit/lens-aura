'use client';

import { motion } from 'framer-motion';
import { Package, Clock, AlertCircle, CheckCircle, Heart } from 'lucide-react';
import AnimatedSection from '@/components/animated-section';

const returnSteps = [
  {
    icon: Package,
    title: 'Package Your Item',
    description: 'Place the item in its original packaging with all accessories and documentation.'
  },
  {
    icon: Clock,
    title: 'Return Window',
    description: 'You have 30 days from the delivery date to initiate a return.'
  },
  {
    icon: AlertCircle,
    title: 'Return Conditions',
    description: 'Items must be unworn, in original condition, and include all original packaging and tags.'
  },
  {
    icon: CheckCircle,
    title: 'Refund Process',
    description: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item.'
  }
];

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-[#f5f2ee]">
      {/* Hero Section */}
      <section className="relative py-16 bg-[#F2D399] mt-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection direction="up" delay={0.1}>
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Returns Policy</h1>
              <div className="flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-2">
                We understand that sometimes things don't work out as planned. While we aim to provide the perfect eyewear for you, we're here to help make the return process as smooth as possible. Your satisfaction is our priority!
              </p>
              <p className="text-gray-700 max-w-2xl mx-auto">
                Please note that customers are responsible for arranging and paying for their own returns. We appreciate your understanding and cooperation in this matter.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column: Steps & Process */}
            <div className="space-y-8">
              <AnimatedSection direction="up" delay={0.2}>
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold mb-6">Return Steps</h2>
                  <div className="space-y-6">
                    {returnSteps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <step.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-1">{step.title}</h3>
                          <p className="text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection direction="up" delay={0.3}>
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold mb-6">How to Return an Item</h2>
                  <ol className="space-y-4 list-decimal list-inside">
                    <li className="text-gray-600">
                      Contact our customer service team at{' '}
                      <a href="mailto:info@lensaura.com.au" className="text-blue-600 hover:underline">
                        info@lensaura.com.au
                      </a>{' '}
                      with your order number and reason for return
                    </li>
                    <li className="text-gray-600">
                      You will receive a return authorization number
                    </li>
                    <li className="text-gray-600">
                      Package your item securely with all original packaging and documentation
                    </li>
                    <li className="text-gray-600">
                      Arrange and pay for your own return shipping
                    </li>
                    <li className="text-gray-600">
                      Send the package to our returns address (provided in the return authorization email)
                    </li>
                    <li className="text-gray-600">
                      Keep your tracking number for reference
                    </li>
                  </ol>
                </div>
              </AnimatedSection>
            </div>

            {/* Right Column: Important Notes & Contact */}
            <div className="space-y-8">
              <AnimatedSection direction="up" delay={0.4}>
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold mb-6">Important Notes</h2>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-1" />
                      <span className="text-gray-600">
                        Custom prescription lenses and contact lenses cannot be returned for hygiene reasons
                      </span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-1" />
                      <span className="text-gray-600">
                        Customers are responsible for all return shipping costs and arrangements
                      </span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-1" />
                      <span className="text-gray-600">
                        Items must be returned in their original condition with all tags and packaging
                      </span>
                    </li>
                  </ul>
                </div>
              </AnimatedSection>

              <AnimatedSection direction="up" delay={0.5}>
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
                  <p className="text-gray-600 mb-2">
                    For any questions about returns, please contact our customer service team:
                  </p>
                  <a href="mailto:info@lensaura.com.au" className="text-blue-600 hover:underline font-medium">
                    info@lensaura.com.au
                  </a>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 