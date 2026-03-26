"use client";

import { useState } from "react";
import { Button, Form, Input, Typography, message } from "antd";
import type { FormInstance } from "antd";
import { Sparkles, WandSparkles } from "lucide-react";
import { generateProductDescription } from "@/actions/product";

type ProductFormSnapshot = {
  name?: string;
  description?: string;
  descriptionLong?: string;
  productBrandId?: string;
  collectionIds?: string[];
};

interface NamedOption {
  id: string;
  name: string;
}

interface AIDescriptionGeneratorProps {
  form: FormInstance<ProductFormSnapshot>;
  brands: NamedOption[];
  collections: NamedOption[];
}

export default function AIDescriptionGenerator({
  form,
  brands,
  collections,
}: AIDescriptionGeneratorProps) {
  const productName = Form.useWatch("name", form) ?? "";
  const currentDescription = Form.useWatch("description", form) ?? "";
  const selectedBrandId = Form.useWatch("productBrandId", form);
  const selectedCollectionIds = Form.useWatch("collectionIds", form) ?? [];

  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    const brandName =
      brands.find((brand) => brand.id === selectedBrandId)?.name ?? null;
    const collectionNames = selectedCollectionIds
      .map(
        (collectionId) =>
          collections.find((collection) => collection.id === collectionId)
            ?.name,
      )
      .filter((name): name is string => Boolean(name));

    setIsGenerating(true);

    try {
      const result = await generateProductDescription({
        name: productName,
        brandName,
        collectionNames,
        existingDescription: currentDescription,
        customPrompt,
      });
      form.setFieldsValue({
        description: result.description,
        descriptionLong: result.descriptionLong,
      });
      message.success("Description generated");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "AI description generation failed.";
      message.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDisabled = !productName.trim() || isGenerating;

  return (
    <div className="mb-4 rounded-2xl border border-sky-100 bg-[linear-gradient(135deg,_#f8fdff_0%,_#effbff_100%)] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Sparkles size={16} className="text-sky-600" />
        Generate with AI
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={customPrompt}
          onChange={(event) => setCustomPrompt(event.target.value)}
          placeholder="Optional: add guidance like premium tone, key benefits, or target audience"
          size="large"
        />
        <Button
          type="primary"
          size="large"
          icon={<WandSparkles size={16} />}
          onClick={handleGenerate}
          loading={isGenerating}
          disabled={generateDisabled}
          style={{
            background:
              "linear-gradient(135deg, rgb(14, 165, 233), rgb(6, 182, 212))",
            borderColor: "transparent",
          }}
        >
          Generate with AI
        </Button>
      </div>

      <Typography.Text className="mt-2 block text-xs text-slate-500">
        {!productName.trim()
          ? "Add the product title first."
          : "AI will write directly into the description field below."}
      </Typography.Text>
    </div>
  );
}
