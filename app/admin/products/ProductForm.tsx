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
} from "antd";
import {
  createProduct,
  updateProduct,
  addMedia,
  linkMedia,
  removeMedia,
  checkSlugAvailability,
} from "@/actions/product";
import { getCollections } from "@/actions/collection";
import { useRouter } from "next/navigation";
import { ProductStatus } from "@prisma/client";
import VariantManager from "./VariantManager";
import { Upload } from "antd";
import { AppConstants } from "@/constants/constants";
import { useCurrency } from "@/components/providers/currency-provider";
import MediaPicker from "@/app/admin/media/media_picker";

interface ProductFormProps {
  initialData?: any;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const [form] = Form.useForm();
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

  // Fetch collections on mount
  React.useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await getCollections();
        setCollections(data);
      } catch (error) {
        console.error("Failed to fetch collections:", error);
        message.error("Failed to load collections");
      } finally {
        setLoadingCollections(false);
      }
    };
    fetchCollections();
  }, []);

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
    const currentSlug = form.getFieldValue("slug");
    // Auto-generate slug if it was empty or previously matches the slugified title pattern
    // For simplicity based on request "slug should be auto generated on user typing and title":
    // We will update it. But we should respect if user manually edited it?
    // Let's stick to: Always update slug when title changes unless we detect manual override...
    // actually simplest UX is: update slug = slugify(title). User can edit slug *after* title is done.
    // If they edit title again, the slug resets. This is common in many CMS unless there is a "lock" button.
    // Given complexity, let's just one-way bind: Title -> Slug.

    const newSlug = slugify(title);
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
      } else {
        const product = await createProduct(productData);
        message.success("Product created");
        router.push(`/admin/products/${product.id}`);
      }
    } catch (error) {
      message.error("Operation failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        ...initialData,
        status: initialData?.status || "DRAFT",
        collectionIds: initialData?.collections?.map((c: any) => c.id) || [],
      }}
      onFinish={onFinish}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Card title="Basic Information" className="mb-6">
            <Form.Item name="name" label="Title" rules={[{ required: true }]}>
              <Input
                placeholder="Short Sleeve T-Shirt"
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
              />
            </Form.Item>

            <Form.Item
              name="price"
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

            <Form.Item
              name="slug"
              label="Slug"
              rules={[{ required: true }]}
              help="Unique URL identifier"
            >
              <Input
                placeholder="short-sleeve-t-shirt"
                onBlur={handleSlugBlur}
              />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} />
            </Form.Item>
          </Card>

          {isEdit && (
            <Card title="Media" className="mb-6">
              <div className="flex flex-wrap gap-4 mb-4">
                {isEdit && (
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
                )}
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
          )}

          {isEdit && (
            <VariantManager
              productId={initialData.id}
              options={initialData.options || []}
              variants={initialData.variants || []}
            />
          )}
        </div>

        <div className="w-full xl:w-80 flex flex-col gap-6">
          <Card title="Status" className="m-0">
            <Form.Item name="status" className="mb-0">
              <Select>
                <Select.Option value={ProductStatus.ACTIVE}>
                  Active
                </Select.Option>
                <Select.Option value={ProductStatus.DRAFT}>Draft</Select.Option>
                <Select.Option value={ProductStatus.ARCHIVED}>
                  Archived
                </Select.Option>
              </Select>
            </Form.Item>
          </Card>

          <Card title="Collections">
            <Form.Item
              name="collectionIds"
              label="Collections"
              help="Select one or more collections for this product"
            >
              <Select
                mode="multiple"
                placeholder="Select collections"
                loading={loadingCollections}
                disabled={loadingCollections}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={collections.map((collection) => ({
                  label: collection.name,
                  value: collection.id,
                }))}
              />
            </Form.Item>
          </Card>
        </div>
      </div>

      <div className="flex justify-end border-t pt-4 bg-white sticky bottom-0 p-4 -mx-4 -mb-4 mt-4">
        <Button type="primary" htmlType="submit" loading={loading}>
          {isEdit ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </Form>
  );
}
