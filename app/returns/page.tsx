'use client';

import { motion } from 'framer-motion';
import { Package, Clock, AlertCircle, CheckCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <AnimatedSection direction="up" delay={0.1}>
          <h1 className="text-4xl font-bold text-center mb-4">Returns Policy</h1>
          <p className="text-gray-600 text-center mb-12">
            We want you to be completely satisfied with your purchase
          </p>
        </AnimatedSection>

        {/* Return Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {returnSteps.map((step, index) => (
            <AnimatedSection key={index} direction="up" delay={0.1 * (index + 2)}>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <step.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Return Process */}
        <AnimatedSection direction="up" delay={0.6}>
          <div className="bg-gray-50 p-8 rounded-lg mb-12">
            <h2 className="text-2xl font-bold mb-6">How to Return an Item</h2>
            <ol className="space-y-4 list-decimal list-inside">
              <li className="text-gray-600">
                Contact our customer service team at{' '}
                <a href="mailto:returns@lensaura.com.au" className="text-blue-600 hover:underline">
                  returns@lensaura.com.au
                </a>{' '}
                with your order number and reason for return
              </li>
              <li className="text-gray-600">
                You will receive a return authorization number and shipping label
              </li>
              <li className="text-gray-600">
                Package your item securely with all original packaging and documentation
              </li>
              <li className="text-gray-600">
                Attach the provided shipping label and drop off at your nearest post office
              </li>
              <li className="text-gray-600">
                Track your return using the provided tracking number
              </li>
            </ol>
          </div>
        </AnimatedSection>

        {/* Important Notes */}
        <AnimatedSection direction="up" delay={0.7}>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Important Notes</h2>
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
                  Return shipping costs are the responsibility of the customer unless the item is defective
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

        {/* Contact Information */}
        <AnimatedSection direction="up" delay={0.8} className="mt-12 text-center">
          <p className="text-gray-600">
            For any questions about returns, please contact our customer service team at{' '}
            <a href="mailto:returns@lensaura.com.au" className="text-blue-600 hover:underline">
              returns@lensaura.com.au
            </a>
          </p>
        </AnimatedSection>
      </div>
    </div>
  );
} 