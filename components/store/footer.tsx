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
      return <DefaultFooter />;
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
        return <DefaultFooter />;
    }
  };

  return (
    <>
      {footerContent()}
      <MultiMarketFooter />
    </>
  );
}

function DefaultFooter() {
  return (
    <footer className="border-t py-12 bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 text-center text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} Cartex Pro. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function MultiMarketFooter() {
  return (
    <footer className="border-t py-12 bg-gray-50 mt-auto">
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
