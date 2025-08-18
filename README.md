# Lens Aura - Premium Eyewear E-commerce Platform

![Lens Aura Logo](/public/images/logo.png)

## Overview

Lens Aura is a modern, full-stack e-commerce platform specializing in premium eyewear. Built with Next.js 14, it offers a seamless shopping experience for prescription glasses, sunglasses, and contact lenses.

## Features

### Customer Features

- 🛍️ Intuitive product browsing and filtering
- 🔍 Advanced search functionality
- 🛒 Real-time shopping cart
- 💳 Secure payment processing with Stripe
- 👤 User authentication and profile management
- 📱 Responsive design for all devices
- 🎯 Virtual try-on for glasses
- 📦 Order tracking and history

### Admin Features

- 📊 Comprehensive dashboard with analytics
- 👥 User management system
- 📦 Inventory and order management
- 🛍️ Product management with bulk operations
- 📈 Sales and revenue tracking
- 🔐 Role-based access control

## Tech Stack

- **Frontend:**

  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - Shadcn UI Components
  - Framer Motion

- **Backend:**

  - Next.js API Routes
  - MongoDB with Mongoose
  - NextAuth.js for authentication
  - Stripe for payments

- **Development Tools:**
  - ESLint
  - Prettier
  - TypeScript
  - Husky for git hooks

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- MongoDB
- Stripe account
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/lens-aura.git
   cd lens-aura
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

   ```env
   MONGODB_URI=your_mongodb_uri
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   STRIPE_SECRET_KEY=your_stripe_secret_key

   ```

4. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
lens-aura/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin panel pages
│   └── (routes)/          # Customer-facing pages
├── components/            # Reusable components
├── lib/                   # Utility functions and configurations
├── models/               # MongoDB models
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@lensaura.com or join our Slack channel.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [MongoDB](https://www.mongodb.com/)
- [Stripe](https://stripe.com/)
