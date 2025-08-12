'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Phone, Mail, MapPin, Clock, Send, Loader2, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AnimatedSection from '@/components/animated-section';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Message sent successfully!', {
          description:
            'Thank you for contacting us. We will get back to you as soon as possible.',
        });
      } else {
        throw new Error(result.message || 'Failed to send message');
      }

      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message', {
        description: 'Please try again later or contact us directly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection direction="up" delay={0.1}>
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-amber-400 to-amber-500 p-4 rounded-full">
                  <Sun className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Get in Touch
              </h1>
              <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto">
                Questions about our premium and standard sunglasses? We're here
                to help you find the perfect pair with UV protection and
                polarized lenses.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <AnimatedSection direction="up" delay={0.2}>
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <h2 className="text-2xl font-bold mb-6 text-slate-900">
                  Send us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                    >
                      <option value="">Select a subject</option>
                      <option value="signature-sunglasses">
                        Signature Sunglasses Inquiry
                      </option>
                      <option value="standard-sunglasses">
                        Essentials Sunglasses Inquiry
                      </option>
                      <option value="product-recommendation">
                        Product Recommendation
                      </option>
                      <option value="order-status">Order Status</option>
                      <option value="warranty-support">
                        Warranty & Support
                      </option>
                      <option value="size-fitting">Size & Fitting</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Message <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full min-h-[150px] resize-none border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                      placeholder="Tell us about your sunglasses needs, questions about UV protection, polarized lenses, or anything else..."
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 1,
                          ease: 'linear',
                        }}
                        className="flex items-center justify-center"
                      >
                        <Loader2 className="w-4 h-4 mr-2" />
                        Sending...
                      </motion.div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </div>
                    )}
                  </Button>
                </form>
              </div>
            </AnimatedSection>

            {/* Contact Information */}
            <AnimatedSection direction="up" delay={0.3}>
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                  <h2 className="text-2xl font-bold mb-6 text-slate-900">
                    Contact Information
                  </h2>
                  <div className="space-y-8">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-r from-slate-100 to-slate-200 p-3 rounded-full">
                        <Phone className="h-6 w-6 text-slate-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">
                          Phone
                        </h3>
                        <p className="text-slate-600">+61 402 564 501</p>
                        <p className="text-sm text-slate-500">
                          Available during business hours
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-r from-slate-100 to-slate-200 p-3 rounded-full">
                        <Mail className="h-6 w-6 text-slate-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">
                          Email
                        </h3>
                        <p className="text-slate-600">info@lensaura.com.au</p>
                        <p className="text-sm text-slate-500">
                          We respond within 24 hours
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-r from-slate-100 to-slate-200 p-3 rounded-full">
                        <Clock className="h-6 w-6 text-slate-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">
                          Business Hours
                        </h3>
                        <p className="text-slate-600">
                          Monday to Friday: 8:30 am - 5:30 pm AEST
                        </p>
                        <p className="text-sm text-slate-500">
                          Australian Eastern Standard Time
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info Card */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-xl p-8 border border-amber-100">
                  <h3 className="text-xl font-bold mb-4 text-amber-900">
                    Why Choose Lens Aura?
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-amber-800">
                        Signature and Essentials sunglasses with UV400
                        protection
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-amber-800">
                        Polarized lenses for enhanced clarity and reduced glare
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-amber-800">
                        1-year warranty on all products
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-amber-800">
                        Expert customer support for all your questions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
}
