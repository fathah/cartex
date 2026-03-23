export interface PagePreset {
  id: string;
  name: string;
  slug: string;
  description: string;
  content: string;
}

export const PAGE_PRESETS: PagePreset[] = [
  {
    id: "privacy",
    name: "Privacy & Policy",
    slug: "privacy",
    description:
      "Standard privacy policy for information collection and usage.",
    content: `# Privacy Policy

Effective Date: [Insert Date]

At [Insert Store Name], we value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information.

## 1. Information We Collect
We collect information you provide directly to us when you:
- Create an account
- Make a purchase
- Sign up for our newsletter
- Contact our customer support

## 2. How We Use Your Information
We use your information to:
- Process your orders
- Improve our website and services
- Communicate with you about your orders and promotions
- Comply with legal obligations

## 3. Data Protection
We implement security measures to maintain the safety of your personal information.

## 4. Third-Party Services
We may use third-party services for payments and analytics. These providers have their own privacy policies.

## 5. Your Rights
You have the right to access, correct, or delete your personal information.

## 6. Contact Us
If you have any questions about this Privacy Policy, please contact us at [Insert Email].`,
  },
  {
    id: "terms",
    name: "Terms & Conditions",
    slug: "terms",
    description: "Terms of service and usage rules for your store.",
    content: `# Terms & Conditions

Welcome to [Insert Store Name]. By using our website, you agree to comply with and be bound by the following terms and conditions.

## 1. Use of Website
You must be at least 18 years old to use this website. You agree to use the website only for lawful purposes.

## 2. Product Information
We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions or other content are error-free.

## 3. Orders and Payment
All orders are subject to acceptance and availability. Prices are subject to change without notice.

## 4. Intellectual Property
All content on this website is the property of [Insert Store Name] and is protected by copyright laws.

## 5. Limitation of Liability
[Insert Store Name] shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website.

## 6. Governing Law
These terms are governed by the laws of [Insert Jurisdiction].

## 7. Changes to Terms
We reserve the right to modify these terms at any time.`,
  },
  {
    id: "shipping",
    name: "Shipping & Refund",
    slug: "shipping",
    description:
      "Policy regarding delivery times, costs, and return processes.",
    content: `# Shipping & Refund Policy

Thank you for shopping at [Insert Store Name]. We want you to be satisfied with your purchase.

## 1. Shipping Policy
- **Processing Time**: Orders are typically processed within [Insert Days] business days.
- **Shipping Rates**: Shipping charges are calculated based on weight and destination.
- **Delivery Estimates**: Standard shipping takes [Insert Days] business days.

## 2. Refund Policy
- **Returns**: You have [Insert Days] calendar days to return an item from the date you received it.
- **Condition**: To be eligible for a return, your item must be unused and in the same condition that you received it.
- **Refunds**: Once we receive your item, we will inspect it and notify you on the status of your refund.

## 3. Exchanges
We only replace items if they are defective or damaged.

## 4. Non-Returnable Items
Certain items cannot be returned, such as [Insert Items, e.g., perishable goods].

## 5. Contact Us
For return requests, please contact [Insert Email].`,
  },
];
