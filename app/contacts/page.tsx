export const metadata = {
  title: 'Contact Lenses - Coming Soon | Lens Aura',
  description: 'Our contact lenses collection is coming soon. Stay tuned for our premium selection of contact lenses.',
  openGraph: {
    title: "Contact Lenses - Coming Soon | Lens Aura",
    description: "Our contact lenses collection is coming soon. Stay tuned for our premium selection of contact lenses.",
    url: "https://lensaura.com.au/contacts",
    siteName: "Lens Aura",
    images: [
      {
        url: "https://lensaura.com.au/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Lens Aura Contact Lenses",
      },
    ],
    locale: "en_AU",
    type: "website",
  },
  alternates: {
    canonical: "https://lensaura.com.au/contacts",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Lenses - Coming Soon | Lens Aura",
    description: "Our contact lenses collection is coming soon. Stay tuned for our premium selection of contact lenses.",
    images: ["https://lensaura.com.au/og-image.jpg"],
  },
};

import ContactsComingSoon from "@/components/ContactsComingSoon";

export default function Page() {
  return <ContactsComingSoon />;
}
