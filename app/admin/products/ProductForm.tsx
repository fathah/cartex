"use client";

import React from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Select,
  Space,
  InputNumber,
  Divider,
  Switch,
  Tabs,
} from "antd";
import { Edit } from "lucide-react";
import {
  createProduct,
  updateProduct,
  linkMedia,
  removeMedia,
  checkSlugAvailability,
} from "@/actions/product";
import { getCollections } from "@/actions/collection";
import { createCategory } from "@/actions/categories";
import { getBrands, createBrand } from "@/actions/brands";
import { useRouter } from "next/navigation";
import { ProductStatus } from "@prisma/client";
import VariantManager from "./VariantManager";
import AIDescriptionGenerator from "./AIDescriptionGenerator";
import { Upload } from "antd";
import { AppConstants } from "@/constants/constants";
import { useCurrency } from "@/components/providers/currency-provider";
import MediaPicker from "@/app/admin/media/media_picker";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const EditorWrapper = ({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (val?: string) => void;
}) => {
  return (
    <div data-color-mode="light">
      <MDEditor value={value} onChange={onChange} height={400} />
    </div>
  );
};

interface ProductFormProps {
  initialData?: any;
  onSuccess?: (productId: string, mode: "create" | "update") => void;
  onRefreshProduct?: (productId: string) => void | Promise<void>;
}

export default function ProductForm({
  initialData,
  onSuccess,
  onRefreshProduct,
}: ProductFormProps) {
  const [form] = Form.useForm();
  const currentSlug = Form.useWatch("slug", form);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const isEdit = !!initialData;
  const [fileList, setFileList] = React.useState<any[]>(
    initialData?.mediaProducts?.map((mp: any) => ({
      uid: mp.media.id,
      name: "image",
      status: "done",
      url: `${AppConstants.DRIVE_ROOT_URL}/${mp.media.url}`,
    })) || [],
  );

  const { currency } = useCurrency();
  const [collections, setCollections] = React.useState<any[]>([]);
  const [loadingCollections, setLoadingCollections] = React.useState(true);

  const [brands, setBrands] = React.useState<any[]>([]);
  const [loadingBrands, setLoadingBrands] = React.useState(true);
  const [newBrandName, setNewBrandName] = React.useState("");
  const inputRef = React.useRef<any>(null);
  const categoryInputRef = React.useRef<any>(null);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [isSlugEditing, setIsSlugEditing] = React.useState(!isEdit);

  // Fetch collections on mount
  React.useEffect(() => {
    const fetchCollections = async () => {
      try {
        const [collData, brandData] = await Promise.all([
          getCollections(),
          getBrands(),
        ]);
        setCollections(collData);
        setBrands(brandData);
      } catch (error) {
        console.error("Failed to fetch form data:", error);
        message.error("Failed to load initial data");
      } finally {
        setLoadingCollections(false);
        setLoadingBrands(false);
      }
    };
    fetchCollections();
  }, []);

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewBrandName(event.target.value);
  };

  const onCategoryNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategoryName(event.target.value);
  };

  const addBrand = async (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    try {
      const brand = await createBrand(newBrandName.trim());
      setBrands([...brands, brand]);
      setNewBrandName("");
      message.success("Brand added");
      form.setFieldsValue({ productBrandId: brand.id });
    } catch (err) {
      console.error(err);
      message.error("Failed to create brand");
    }
  };

  const addCategory = async (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const slug = slugify(newCategoryName.trim());
      const result = await createCategory({
        name: newCategoryName.trim(),
        slug,
      });
      if (result.success && result.category) {
        setCollections([...collections, result.category]);
        setNewCategoryName("");
        message.success("Category added");
        const currentSelected = form.getFieldValue("collectionIds") || [];
        form.setFieldsValue({
          collectionIds: [...currentSelected, result.category.id],
        });
      } else {
        message.error(result.error || "Failed to create category");
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to create category");
    }
  };

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start of text
      .replace(/-+$/, ""); // Trim - from end of text
  };

  const ensureUniqueSlug = async (baseSlug: string): Promise<string> => {
    let currentSlug = baseSlug;
    let available = await checkSlugAvailability(currentSlug, initialData?.id);

    while (!available) {
      // Append 4 random alphanumeric characters
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      currentSlug = `${baseSlug}-${randomSuffix}`;
      available = await checkSlugAvailability(currentSlug, initialData?.id);
    }
    return currentSlug;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const newSlug = slugify(title);
    if (isEdit) {
      return;
    }
    form.setFieldsValue({ slug: newSlug });
  };

  const handleTitleBlur = async () => {
    const currentSlug = form.getFieldValue("slug");
    if (currentSlug) {
      const uniqueSlug = await ensureUniqueSlug(currentSlug);
      if (uniqueSlug !== currentSlug) {
        form.setFieldsValue({ slug: uniqueSlug });
        message.info(`Slug adjusted to '${uniqueSlug}' to ensure uniqueness.`);
      }
    }
  };

  // Also handle Slug Blur in case they manually edit slug
  const handleSlugBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      const uniqueSlug = await ensureUniqueSlug(slugify(val));
      if (uniqueSlug !== slugify(val)) {
        form.setFieldsValue({ slug: uniqueSlug });
        message.info(`Slug adjusted to '${uniqueSlug}' to ensure uniqueness.`);
      } else {
        form.setFieldsValue({ slug: uniqueSlug }); // ensure formatting
      }
    }
  };

  // handleUpload removed since we use MediaPicker

  const handleRemove = async (file: any) => {
    try {
      if (isEdit && file.uid) {
        await removeMedia(file.uid, initialData.id);
        message.success("Deleted image");
        // Remove from fileList state
        setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
        return true; // proceed to remove from list logic of antd if needed
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to delete image");
      return false; // prevent removal
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Transform collectionIds array to proper Prisma relation format
      const productData: any = { ...values };

      if (values.collectionIds && values.collectionIds.length > 0) {
        if (isEdit) {
          // For updates, use 'set' to replace all relations
          productData.collections = {
            set: values.collectionIds.map((id: string) => ({ id })),
          };
        } else {
          // For creates, use 'connect' to link existing collections
          productData.collections = {
            connect: values.collectionIds.map((id: string) => ({ id })),
          };
        }
        delete productData.collectionIds;
      } else if (isEdit && values.collectionIds?.length === 0) {
        // If editing and no collections selected, disconnect all
        productData.collections = {
          set: [],
        };
        delete productData.collectionIds;
      }

      if (isEdit) {
        await updateProduct(initialData.id, productData);
        message.success("Product updated");
        onSuccess?.(initialData.id, "update");
      } else {
        const product = await createProduct(productData);
        message.success("Product created");
        if (onSuccess) {
          onSuccess(product.id, "create");
        } else {
          router.push(`/admin/products/${product.id}`);
        }
      }
    } catch (error) {
      message.error("Operation failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (initialData?.id) {
      onRefreshProduct?.(initialData.id);
    }
  };

  const basicInfo = (
    <Card title="Basic Information" className="mb-6">
      <Form.Item name="name" label="Title" rules={[{ required: true }]}>
        <Input
          placeholder="Short Sleeve T-Shirt"
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
        />
      </Form.Item>

      {!isEdit && (
        <Form.Item
          name="originalPrice"
          label="Base Price"
          rules={[
            {
              required: !isEdit,
              message: "Price is required for new products",
            },
          ]}
          help={
            isEdit
              ? "To update price, edit the variants below"
              : "Initial price for the default variant"
          }
        >
          <InputNumber
            prefix={currency}
            style={{ width: "100%" }}
            min={0}
            precision={2}
            disabled={isEdit && initialData.variants?.length > 0}
          />
        </Form.Item>
      )}

      <Form.Item name="slug" label="URL Slug" rules={[{ required: true }]}>
        {isSlugEditing ? (
          <div className="flex gap-2">
            <Input
              value={currentSlug}
              placeholder="short-sleeve-t-shirt"
              onChange={(e) => form.setFieldsValue({ slug: e.target.value })}
              onBlur={handleSlugBlur}
              addonBefore={`${AppConstants.PUBLIC_URL}/product/`}
            />
            <Button
              type="default"
              onClick={() => {
                const currentSlug = form.getFieldValue("slug");
                if (currentSlug) {
                  form.setFieldsValue({ slug: slugify(currentSlug) });
                }
                setIsSlugEditing(false);
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 py-1">
            <div className="break-all text-blue-700">
              <span>{`${AppConstants.PUBLIC_URL}/product/`}</span>
              <span className="underline decoration-dashed underline-offset-4">
                {currentSlug || ""}
              </span>
            </div>
            <Button
              type="text"
              icon={<Edit size={16} />}
              onClick={() => setIsSlugEditing(true)}
            />
          </div>
        )}
      </Form.Item>
    </Card>
  );

  const descriptionSection = (
    <Card title="Product Description" className="mb-6">
      <AIDescriptionGenerator
        form={form}
        brands={brands}
        collections={collections}
      />
      <Form.Item
        name="description"
        label="Description"
        help="Full Markdown Editor support"
      >
        <EditorWrapper />
      </Form.Item>
    </Card>
  );

  const mediaSection = isEdit ? (
    <Card title="Media" className="mb-6">
      <div className="flex flex-wrap gap-4 mb-4">
        <MediaPicker
          onSelect={async (media: any) => {
            try {
              await linkMedia(initialData.id, media.id);
              message.success("Media linked successfully");
              setFileList((prev) => [
                ...prev,
                {
                  uid: media.id,
                  name: media.url.split("/").pop() || "image",
                  status: "done",
                  url: `${AppConstants.DRIVE_ROOT_URL}/${media.url}`,
                },
              ]);
            } catch (err) {
              console.error(err);
              message.error(
                "Failed to link media. It might already be linked.",
              );
            }
          }}
        />
      </div>

      <Upload
        listType="picture-card"
        fileList={fileList}
        onRemove={handleRemove}
        onPreview={() => {}} // Handle preview if needed
        showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
      >
        {/* No upload button rendered here */}
      </Upload>
    </Card>
  ) : null;

  const variantsSection = isEdit ? (
    <VariantManager
      productId={initialData.id}
      options={initialData.options || []}
      variants={initialData.variants || []}
      onRefresh={handleRefresh}
    />
  ) : null;

  const organizationSection = (
    <div className="flex flex-col gap-6">
      <Card className="m-0">
        <Form.Item name="collectionIds" label="Collections">
          <Select
            mode="multiple"
            placeholder="Select collections"
            loading={loadingCollections}
            disabled={loadingCollections}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={collections.map((collection) => ({
              label: collection.name,
              value: collection.id,
            }))}
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: "8px 0" }} />
                <Space style={{ padding: "0 8px 4px" }}>
                  <Input
                    placeholder="Please enter category"
                    ref={categoryInputRef}
                    value={newCategoryName}
                    onChange={onCategoryNameChange}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  <Button type="text" onClick={addCategory}>
                    Add Category
                  </Button>
                </Space>
              </>
            )}
          />
        </Form.Item>

        <Form.Item name="productBrandId" label="Product Brand" className="mb-0">
          <Select
            placeholder="Select a brand"
            loading={loadingBrands}
            disabled={loadingBrands}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={brands.map((b) => ({
              label: b.name,
              value: b.id,
            }))}
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: "8px 0" }} />
                <Space style={{ padding: "0 8px 4px" }}>
                  <Input
                    placeholder="Please enter brand"
                    ref={inputRef}
                    value={newBrandName}
                    onChange={onNameChange}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  <Button type="text" onClick={addBrand}>
                    Add Brand
                  </Button>
                </Space>
              </>
            )}
          />
        </Form.Item>

        <Form.Item name="status" label="Visibility Status" className="mb-4">
          <Select>
            <Select.Option value={ProductStatus.ACTIVE}>Active</Select.Option>
            <Select.Option value={ProductStatus.DRAFT}>Draft</Select.Option>
            <Select.Option value={ProductStatus.ARCHIVED}>
              Archived
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="isFeatured"
          label="Mark as Featured"
          valuePropName="checked"
          className="mb-0"
        >
          <Switch />
        </Form.Item>
      </Card>
    </div>
  );

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        ...initialData,
        status: initialData?.status || "DRAFT",
        isFeatured: initialData?.isFeatured || false,
        collectionIds: initialData?.collections?.map((c: any) => c.id) || [],
      }}
      onFinish={onFinish}
    >
      {isEdit ? (
        <Tabs
          defaultActiveKey="basic"
          items={[
            {
              key: "basic",
              label: "Basic Info",
              children: (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">{basicInfo}</div>
                    <div className="w-full xl:w-80">{organizationSection}</div>
                  </div>
                  <div className="w-full">{descriptionSection}</div>
                </div>
              ),
            },
            {
              key: "media",
              label: "Media",
              children: <div className="max-w-4xl">{mediaSection}</div>,
            },
            {
              key: "variants",
              label: "Variants",
              children: <div className="max-w-5xl">{variantsSection}</div>,
            },
          ]}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">{basicInfo}</div>
            <div className="w-full xl:w-80">{organizationSection}</div>
          </div>
          <div className="w-full">{descriptionSection}</div>
        </div>
      )}

      <div className="flex justify-end border-t pt-4 bg-white sticky bottom-0 p-4 -mx-4 -mb-4 mt-4">
        <Button type="primary" htmlType="submit" loading={loading}>
          {isEdit ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </Form>
  );
}
