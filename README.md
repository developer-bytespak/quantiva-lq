# Quantiva Landing Page

A modern, responsive landing page built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- **Hero Section** - Eye-catching introduction with call-to-action buttons
- **Services** - Showcase of platform features and capabilities
- **Demo Trades** - Real examples of successful trades
- **How It Works** - Step-by-step guide to getting started
- **Choose Your Plan** - Pricing plans with feature comparisons
- **Contact Us** - Contact form and company information

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

```
quantiva-lp/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main landing page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Hero.tsx
│   ├── Services.tsx
│   ├── DemoTrades.tsx
│   ├── HowItWorks.tsx
│   ├── ChooseYourPlan.tsx
│   └── ContactUs.tsx
├── public/                # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Build for Production

```bash
npm run build
npm start
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React 18** - UI library

## Customization

Each component is located in the `components/` directory and can be easily customized:

- Update colors in `tailwind.config.ts`
- Modify component content in individual component files
- Adjust layouts and spacing as needed

## License

This project is open source and available under the MIT License.

