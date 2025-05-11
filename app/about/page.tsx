'use client';

import { motion } from 'framer-motion';
import { Sparkles, Eye, Heart } from 'lucide-react';
import AnimatedSection from '@/components/animated-section';
import Image from 'next/image';

const values = [
  {
    icon: Sparkles,
    title: 'Premium Quality',
    description: 'We craft each frame with meticulous attention to detail, using only the finest materials to ensure lasting beauty and durability.'
  },
  {
    icon: Eye,
    title: 'Innovative Design',
    description: 'Our in-house design team creates contemporary styles that blend timeless elegance with modern aesthetics.'
  },
  {
    icon: Heart,
    title: 'Customer Focus',
    description: "We're committed to providing exceptional service and ensuring every customer finds their perfect pair of glasses."
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <AnimatedSection direction="up" delay={0.1}>
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">About Lens Aura</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Redefining eyewear with premium quality and accessible luxury
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <AnimatedSection direction="up" delay={0.2}>
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-gray-600 mb-4">
                At Lens Aura, we believe that premium eyewear should be accessible to everyone. We've reimagined the
                traditional eyewear industry by combining exceptional craftsmanship with thoughtful design and fair pricing.
              </p>
              <p className="text-gray-600 mb-4">
                Our journey began with a simple yet powerful idea: to create eyewear that not only enhances vision but
                also elevates style. By designing our frames in-house and maintaining direct relationships with our
                customers, we've created a new standard in the eyewear industry.
              </p>
              <p className="text-gray-600">
                Today, we continue to push boundaries in eyewear design while staying true to our commitment to quality,
                innovation, and customer satisfaction.
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.3}>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/images/about-us.jpg"
                alt="Lens Aura eyewear collection"
                className="w-full h-full object-cover"
                width={500}
                height={500}
                priority
              />
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection direction="up" delay={0.4}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-lg">
                <div className="mb-4">
                  <value.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection direction="up" delay={0.5}>
          <div className="bg-gray-50 p-12 rounded-lg">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Our Commitment to Excellence</h2>
              <p className="text-gray-600 mb-6">
                Every pair of Lens Aura glasses is crafted with precision and care. We use premium materials like
                Italian acetate, German-engineered hinges, and scratch-resistant lenses to ensure your eyewear
                stands the test of time.
              </p>
              <p className="text-gray-600">
                Our commitment extends beyond the product. We're dedicated to providing exceptional service,
                from helping you find the perfect frame to ensuring your complete satisfaction with every purchase.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
