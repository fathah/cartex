export interface SectionDesign {
  id: string;
  name: string;
  thumbnail?: string;
  defaultConfig: any;
}

export interface SectionMetadata {
  key: string;
  name: string;
  description: string;
  designs: SectionDesign[];
}

export const SECTIONS: SectionMetadata[] = [
  {
    key: "navbar",
    name: "Navbar",
    description: "The top navigation bar of your website",
    designs: [
      {
        id: "navbar-1",
        name: "Classic Navbar",
        defaultConfig: {
          showLogo: true,
          sticky: true,
          links: [
            { label: "Home", url: "/" },
            { label: "Shop", url: "/shop" },
          ],
        },
      },
      {
        id: "navbar-2",
        name: "Modern Transparent",
        defaultConfig: {
          showLogo: true,
          transparent: true,
          links: [
            { label: "Home", url: "/" },
            { label: "Products", url: "/products" },
          ],
        },
      },
    ],
  },
  {
    key: "footer",
    name: "Footer",
    description: "The bottom section of your website",
    designs: [
      {
        id: "minimalist-luxe",
        name: "Minimalist Luxe",
        defaultConfig: {
          backgroundColor: "#ffffff",
          textColor: "#111827",
          showLogo: true,
          copyrightText: "© 2024 Cartex Pro. All rights reserved.",
          links: [
            { label: "Home", url: "/" },
            { label: "Shop", url: "/shop" },
            { label: "Privacy Policy", url: "/privacy" },
            { label: "Terms & Conditions", url: "/terms" },
            { label: "Shipping & Refund", url: "/shipping" },
          ],
          socials: {
            instagram: "https://instagram.com",
            twitter: "https://twitter.com",
          },
        },
      },
      {
        id: "modern-corporate",
        name: "Modern Corporate",
        defaultConfig: {
          backgroundColor: "#111827",
          textColor: "#ffffff",
          columns: [
            {
              title: "Product",
              links: [
                { label: "Features", url: "#" },
                { label: "Integrations", url: "#" },
                { label: "Pricing", url: "#" },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "About Us", url: "#" },
                { label: "Blog", url: "#" },
                { label: "Contact Us", url: "/contact" },
              ],
            },
            {
              title: "Legal",
              links: [
                { label: "Privacy Policy", url: "/privacy" },
                { label: "Terms & Conditions", url: "/terms" },
                { label: "Shipping & Refund", url: "/shipping" },
              ],
            },
          ],
        },
      },
      {
        id: "elegant-grid",
        name: "Elegant Grid",
        defaultConfig: {
          backgroundColor: "#f9fafb",
          textColor: "#374151",
          primaryColor: "#4f46e5",
          columns: [
            {
              title: "Shop",
              links: [
                { label: "All Products", url: "/shop" },
                { label: "Featured", url: "/featured" },
                { label: "Collections", url: "/collections" },
              ],
            },
            {
              title: "Information",
              links: [
                { label: "About Our Store", url: "/about" },
                { label: "Privacy Policy", url: "/privacy" },
                { label: "Terms & Conditions", url: "/terms" },
                { label: "Shipping & Refund", url: "/shipping" },
              ],
            },
          ],
        },
      },
      {
        id: "classic-bordered",
        name: "Classic Bordered",
        defaultConfig: {
          backgroundColor: "#ffffff",
          textColor: "#111827",
          borderColor: "#e5e7eb",
          showNewsletter: true,
          links: [
            { label: "Home", url: "/" },
            { label: "Privacy Policy", url: "/privacy" },
            { label: "Terms & Conditions", url: "/terms" },
            { label: "Shipping & Refund", url: "/shipping" },
          ],
        },
      },
    ],
  },
];
