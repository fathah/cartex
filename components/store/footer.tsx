import { getSectionConfig } from "@/actions/sections";
import MinimalistFooter from "./footers/MinimalistFooter";
import CorporateFooter from "./footers/CorporateFooter";
import GridFooter from "./footers/GridFooter";
import ClassicFooter from "./footers/ClassicFooter";
import MarketPicker from "./MarketPicker";

export default async function StoreFooter() {
  const footerConfig = await getSectionConfig("footer");

  const footerContent = () => {
    if (!footerConfig) {
      return <div></div>;
    }

    const { id, configs } = footerConfig;

    switch (id) {
      case "minimalist-luxe":
        return <MinimalistFooter configs={configs} />;
      case "modern-corporate":
        return <CorporateFooter configs={configs} />;
      case "elegant-grid":
        return <GridFooter configs={configs} />;
      case "classic-bordered":
        return <ClassicFooter configs={configs} />;
      default:
        return <div></div>;
    }
  };

  return (
    <>
      {footerContent()}
      <MultiMarketFooter />
    </>
  );
}

function MultiMarketFooter() {
  return (
    <footer className="border-t border-gray-300 py-5 bg-black text-white mt-auto">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <MarketPicker />
          <div className="pt-6 text-center text-gray-500">
            <p>
              &copy; {new Date().getFullYear()} Cartex Pro. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
