"use client";

import React from 'react';
import { Form, Input, Button, Card, message, Select, Space, InputNumber } from 'antd';
import { createProduct, updateProduct, addMedia, removeMedia, checkSlugAvailability } from '@/app/actions/product';
import { useRouter } from 'next/navigation';
import { ProductStatus } from '@prisma/client';
import VariantManager from './variant-manager';
import { UploadOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import { generateSignedUrl } from '@/services/zdrive';
import { uploadFile } from '@/services/zdrive-client';
import { AppConstants } from '@/constants/constants';
import { useCurrency } from '@/components/providers/currency-provider';

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
            name: 'image',
            status: 'done',
            url: `${AppConstants.DRIVE_ROOT_URL}/${mp.media.url}`,
        })) || []
    );

    const {currency } = useCurrency();

    const slugify = (text: string) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
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
        const currentSlug = form.getFieldValue('slug');
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
        const currentSlug = form.getFieldValue('slug');
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
    }

    const handleUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;
        try {
            const signedUrl = await generateSignedUrl(file.name);
            if (!signedUrl) throw new Error('Failed to get signed URL');

            const uploadRes = await uploadFile(file, signedUrl);
            if (!uploadRes.success || !uploadRes.filename) throw new Error('Upload to ZDrive failed');

            if (isEdit) {
             
                await addMedia(initialData.id, uploadRes.filename, 'IMAGE');
               
                onSuccess("ok");
                message.success("Uploaded successfully");
            } else {
                message.warning("Please save the product first to upload media.");
                onError(new Error("Save product first"));
            }

        } catch (err) {
            console.error(err);
            onError(new Error('Upload failed'));
            message.error('Upload failed');
        };
    }

    const handleRemove = async (file: any) => {
        try {
            if (isEdit && file.uid) {
                await removeMedia(file.uid, initialData.id);
                message.success("Deleted image");
                // Remove from fileList state
                setFileList(prev => prev.filter(item => item.uid !== file.uid));
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
            if (isEdit) {
                await updateProduct(initialData.id, values);
                message.success('Product updated');
            } else {
                const product = await createProduct(values);
                message.success('Product created');
                router.push(`/admin/products/${product.id}`);
            }
        } catch (error) {
            message.error('Operation failed');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={initialData || { status: 'DRAFT' }}
            onFinish={onFinish}
        >
            <div className="flex gap-6">
                <div className="flex-1">
                    <Card title="Basic Information" className="mb-6">
                        <Form.Item
                            name="name"
                            label="Title"
                            rules={[{ required: true }]}
                        >
                            <Input placeholder="Short Sleeve T-Shirt" onChange={handleTitleChange} onBlur={handleTitleBlur} />
                        </Form.Item>

                        <Form.Item
                            name="price"
                            label="Base Price"
                            rules={[{ required: !isEdit, message: 'Price is required for new products' }]}
                            help={isEdit ? "To update price, edit the variants below" : "Initial price for the default variant"}
                        >
                            <InputNumber
                                prefix={currency}
                                style={{ width: '100%' }}
                                min={0}
                                precision={2}
                                disabled={isEdit && (initialData.variants?.length > 0)}
                            />
                        </Form.Item>

                        <Form.Item
                            name="slug"
                            label="Slug"
                            rules={[{ required: true }]}
                            help="Unique URL identifier"
                        >
                            <Input placeholder="short-sleeve-t-shirt" onBlur={handleSlugBlur} />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Description"
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>
                    </Card>

                    <Card title="Media" className="mb-6">
                        <Upload
                            customRequest={handleUpload}
                            listType="picture-card"
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            onRemove={handleRemove}
                            onPreview={() => { }} // Handle preview if needed
                        >
                            {fileList.length >= 8 ? null : (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            )}
                        </Upload>
                        {!isEdit && <div className="text-gray-500 text-xs mt-2">Save product to upload media.</div>}
                    </Card>

                    {isEdit && (
                        <VariantManager
                            productId={initialData.id}
                            options={initialData.options || []}
                            variants={initialData.variants || []}
                        />
                    )}
                </div>
        
                <div className="w-80">
                    <Card title="Status" className="mb-6">
                        <Form.Item name="status" className="mb-0">
                            <Select>
                                <Select.Option value={ProductStatus.ACTIVE}>Active</Select.Option>
                                <Select.Option value={ProductStatus.DRAFT}>Draft</Select.Option>
                                <Select.Option value={ProductStatus.ARCHIVED}>Archived</Select.Option>
                            </Select>
                        </Form.Item>
                    </Card>

                    {/* Organization Card can go here */}
                </div>
            </div>

            <div className="flex justify-end border-t pt-4 bg-white sticky bottom-0 p-4 -mx-4 -mb-4 mt-4">
                <Button type="primary" htmlType="submit" loading={loading}>
                    {isEdit ? 'Save Changes' : 'Create Product'}
                </Button>
            </div>
        </Form>
    );
}
