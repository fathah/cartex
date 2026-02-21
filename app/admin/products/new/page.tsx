import ProductForm from "../ProductForm";
import { Button } from "antd";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products">
          <Button icon={<ArrowLeft size={16} />} type="text" />
        </Link>
        <h2 className="text-2xl font-bold m-0">Add Product</h2>
      </div>
      <ProductForm />
    </div>
  );
}
