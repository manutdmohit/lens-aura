import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Lenses - Coming Soon | Lens Aura',
  description: 'Our contact lenses collection is coming soon. Stay tuned for our premium selection of contact lenses.',
};

export default function ContactsPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex-grow max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Contact Lenses</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Our premium collection of contact lenses is coming soon. Stay tuned for our carefully curated selection of high-quality contact lenses.
        </p>
      </div>
    </main>
  );
}
