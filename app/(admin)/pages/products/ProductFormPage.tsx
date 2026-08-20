// // ============================================
// app/(admin)/pages/products/ProductFormPage.tsx
// ============================================
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { categoriesApi } from "../../../../lib/api/categories";
import { productsApi } from "../../../../lib/api/products";
import ProductAttributeFields from "../../components/products/ProductAttributeFields";
import ProductFormBasicInfo from "../../components/products/form/ProductFormBasicInfo";
import ProductFormImages from "../../components/products/form/ProductFormImages";
import ProductFormPricing from "../../components/products/form/ProductFormPricing";
import ProductTypeSelector from "../../components/products/form/ProductTypeSelector";
import VariantConfiguration from "../../components/products/form/VariantConfiguration";
import dynamic from "next/dynamic";
import Loader from "../../../components/shared/Loader";
import ProductFormVideos from "../../components/products/form/ProductFormVideos";
import { VariantOption, ProductVariant } from "../../../../types/product-variants";

const LazyJoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

interface ProductFormPageProps {
  mode: "add" | "edit";
  productId?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function ProductFormPage({
  mode,
  productId,
}: ProductFormPageProps) {
  const router = useRouter();
  const editor = useRef(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [newVideos, setNewVideos] = useState<File[]>([]);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [productAttributes, setProductAttributes] = useState<{
    [key: string]: any;
  }>({});

  // Variant states
  const [hasVariants, setHasVariants] = useState(false);
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    short_description: "",
    brand: "",
    category_id: "",
    tags: "",
    price: "",
    compare_at_price: "",
    sku: "",
    stock_quantity: "",
    low_stock_threshold: "10",
    unit_of_measure: "",
    status: "draft",
    is_featured: false,
    is_bestseller: false,
    is_on_sale: false,
    is_trending: false,
    meta_title: "",
    meta_description: "",
    stripe_tax_code: "txcd_99999999",
  });

  const [images, setImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  const joditConfig = useMemo(
    () => ({
      readonly: false,
      placeholder: "Enter detailed product description...",
      minHeight: 400,
      toolbar: true,
      spellcheck: true,
      language: "en",
      toolbarButtonSize: "middle" as const,
      toolbarAdaptive: false,
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      buttons: [
        "bold",
        "italic",
        "underline",
        "|",
        "ul",
        "ol",
        "|",
        "font",
        "fontsize",
        "paragraph",
        "|",
        "align",
        "|",
        "link",
        "table",
        "|",
        "undo",
        "redo",
        "|",
        "source",
      ],
    }),
    [],
  );

  useEffect(() => {
    fetchCategories();
    if (mode === "edit" && productId) {
      fetchProduct();
    }
  }, [mode, productId]);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll(false);
      setCategories(data.categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProduct = async () => {
    if (!productId) return;

    try {
      setLoading(true);
      const data = await productsApi.getById(productId);
      const product = data.product;

      setFormData({
        name: product.name || "",
        description: product.description || "",
        short_description: product.short_description || "",
        brand: product.brand || "",
        category_id: product.category_id?._id || product.category_id || "",
        tags: product.tags?.join(", ") || "",
        price: product.pricing?.price?.toString() || "",
        compare_at_price: product.pricing?.compare_at_price?.toString() || "",
        sku: product.inventory?.sku || "",
        stock_quantity: product.inventory?.stock_quantity?.toString() || "",
        low_stock_threshold:
          product.inventory?.low_stock_threshold?.toString() || "10",
        unit_of_measure: product.unit_of_measure || "",
        status: product.status || "draft",
        is_featured: product.badges?.is_featured || false,
        is_bestseller: product.badges?.is_bestseller || false,
        is_on_sale: product.badges?.is_on_sale || false,
        is_trending: product.badges?.is_trending || false,
        meta_title: product.seo?.meta_title || "",
        meta_description: product.seo?.meta_description || "",
        stripe_tax_code: product.stripe_tax_code || "txcd_99999999",
      });

      setImages(product.images || []);
      setVideos(product.videos || []);
      setProductAttributes(product.attributes || {});
      
      // Set variant data
      setHasVariants(product.hasVariants || false);
      setVariantOptions(product.variantOptions || []);
      setVariants(product.variants || []);
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateAttributes = (): boolean => {
    const selectedCategory = categories.find(
      (c) => c._id === formData.category_id,
    );
    if (!selectedCategory) return true;

    // Add validation logic here
    return true;
  };

  const uploadImages = async (): Promise<any[]> => {
    if (newImages.length === 0) return [];

    setUploadingImages(true);
    const uploadedImages: any[] = [];

    try {
      for (const file of newImages) {
        const data = await productsApi.uploadImage(file);
        uploadedImages.push({
          url: data.url,
          alt_text: file.name,
          is_primary: images.length === 0 && uploadedImages.length === 0,
          sort_order: images.length + uploadedImages.length,
        });
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Some images failed to upload");
    } finally {
      setUploadingImages(false);
    }

    return uploadedImages;
  };

  const uploadVideos = async (): Promise<any[]> => {
    if (newVideos.length === 0) return [];

    setUploadingVideos(true);
    const uploadedVideos: any[] = [];

    try {
      for (const file of newVideos) {
        const formData = new FormData();
        formData.append("video", file);

        const data = await productsApi.uploadVideo(file);
        uploadedVideos.push({
          url: data.url,
          thumbnail: data.thumbnail,
          is_primary: videos.length === 0 && uploadedVideos.length === 0,
          sort_order: videos.length + uploadedVideos.length,
          duration: data.duration,
          size: data.compressedSize,
        });
      }
    } catch (error) {
      console.error("Video upload failed:", error);
      alert("Some videos failed to upload");
    } finally {
      setUploadingVideos(false);
    }

    return uploadedVideos;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Product name is required");
      return;
    }

    if (images.length === 0 && newImages.length === 0) {
      alert("At least one product image is required");
      return;
    }

    if (!formData.category_id) {
      alert("Category is required");
      return;
    }

    // Validation for simple products
    if (!hasVariants) {
      if (!formData.price) {
        alert("Price is required");
        return;
      }

      if (!formData.sku.trim()) {
        alert("SKU is required");
        return;
      }
    }

    // Validation for variant products
    if (hasVariants) {
      if (variantOptions.length === 0) {
        alert("At least one variant option is required for variant products");
        return;
      }

      if (variantOptions.some(opt => opt.values.length === 0)) {
        alert("All variant options must have at least one value");
        return;
      }

      if (variants.length === 0) {
        alert("No variants generated. Please configure variant options properly");
        return;
      }

      // Validate all variants have SKUs
      if (variants.some(v => !v.sku || !v.sku.trim())) {
        alert("All variants must have a SKU");
        return;
      }
    }

    if (!validateAttributes()) {
      return;
    }

    setLoading(true);

    try {
      const uploadedImages = await uploadImages();
      const uploadedVideos = await uploadVideos();
      const allImages = [...images, ...uploadedImages];
      const allVideos = [...videos, ...uploadedVideos];

      const baseSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const slug =
        mode === "edit" && productId
          ? formData.meta_title
          : `${baseSlug}-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 9)}`;

      const tags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Prepare product data based on product type
      const productData: any = {
        name: formData.name.trim(),
        description: formData.description,
        short_description: formData.short_description?.trim(),
        brand: formData.brand?.trim(),
        category_id: formData.category_id,
        subcategory_ids: [],
        tags,
        unit_of_measure: formData.unit_of_measure || undefined,
        seo: {
          slug,
          meta_title: formData.meta_title?.trim() || formData.name,
          meta_description:
            formData.meta_description?.trim() || formData.short_description,
        },
        status: formData.status,
        badges: {
          is_featured: formData.is_featured,
          is_bestseller: formData.is_bestseller,
          is_on_sale: formData.is_on_sale,
          is_trending: formData.is_trending,
        },
        is_visible: true,
        visibility: "public",
        images: allImages,
        videos: allVideos,
        attributes: productAttributes,
        hasVariants: hasVariants,
        stripe_tax_code: formData.stripe_tax_code || "txcd_99999999",
      };

      if (hasVariants) {
        // For variant products
        productData.variantOptions = variantOptions;
        productData.variants = variants;
        
        // Generate unique base SKU for variant products
        const uniqueBaseSku = `${formData.sku || `PROD-${Date.now()}`}-BASE`;
        
        // Set dummy pricing/inventory (will be overridden by variant data)
        productData.pricing = {
          price: 0,
          currency: "PKR",
        };
        productData.inventory = {
          sku: uniqueBaseSku,
          stock_quantity: 0,
          low_stock_threshold: 10,
          track_inventory: true,
          allow_backorder: false,
          stock_status: "in_stock",
        };
        productData.shipping = {
          requires_shipping: true,
          is_fragile: false,
        };
      } else {
        // For simple products
        const stockQty = parseInt(formData.stock_quantity) || 0;
        const lowThreshold = parseInt(formData.low_stock_threshold) || 10;
        let stockStatus:
          | "in_stock"
          | "low_stock"
          | "out_of_stock"
          | "discontinued" = "in_stock";

        if (stockQty === 0) {
          stockStatus = "out_of_stock";
        } else if (stockQty <= lowThreshold) {
          stockStatus = "low_stock";
        }

        productData.pricing = {
          price: parseFloat(formData.price),
          compare_at_price: formData.compare_at_price
            ? parseFloat(formData.compare_at_price)
            : undefined,
          currency: "PKR",
        };
        productData.inventory = {
          sku: formData.sku.trim(),
          stock_quantity: stockQty,
          low_stock_threshold: lowThreshold,
          track_inventory: true,
          allow_backorder: false,
          stock_status: stockStatus,
        };
        productData.shipping = {
          requires_shipping: true,
          is_fragile: false,
        };
        productData.variantOptions = [];
        productData.variants = [];
      }

      if (mode === "edit" && productId) {
        await productsApi.update(productId, productData);
        alert("Product updated successfully");
        router.push(`/admin/products/${productId}`);
      } else {
        const response = await productsApi.create(productData);
        alert("Product created successfully");
        router.push("/admin/products");
      }
    } catch (error: any) {
      console.error(`Failed to ${mode} product:`, error);
      alert(error.message || `Failed to ${mode} product. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (updates: any) => {
    setFormData({ ...formData, ...updates });
  };

  const handleProductTypeChange = (newHasVariants: boolean) => {
    if (mode === "edit") {
      // Don't allow changing product type in edit mode
      return;
    }
    setHasVariants(newHasVariants);
    
    // Reset variant-related data when switching
    if (!newHasVariants) {
      setVariantOptions([]);
      setVariants([]);
    }
  };

  if (loading && mode === "edit") {
    return (
      <div className="relative h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/products")}
          className="text-theme-text-muted-light hover:text-theme-text-primary-light"
        >
          <FaArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          {mode === "edit" ? "Edit Product" : "Add New Product"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Type Selection (only for new products) */}
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6">
          <ProductTypeSelector
            hasVariants={hasVariants}
            onChange={handleProductTypeChange}
            disabled={mode === "edit"}
          />
        </div>

        {/* Images */}
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6">
          <ProductFormImages
            images={images}
            newImages={newImages}
            onImageSelect={(files) => setNewImages([...newImages, ...files])}
            onRemoveExisting={(index) => {
              if (images.length + newImages.length <= 1) {
                alert(
                  "Cannot delete the last image. At least one image is required.",
                );
                return;
              }
              setImages(images.filter((_, i) => i !== index));
            }}
            onRemoveNew={(index) => {
              if (images.length + newImages.length <= 1) {
                alert(
                  "Cannot delete the last image. At least one image is required.",
                );
                return;
              }
              setNewImages(newImages.filter((_, i) => i !== index));
            }}
          />
        </div>

        {/* Videos */}
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6">
          <ProductFormVideos
            videos={videos}
            newVideos={newVideos}
            onVideoSelect={(files) => setNewVideos([...newVideos, ...files])}
            onRemoveExisting={(index) =>
              setVideos(videos.filter((_, i) => i !== index))
            }
            onRemoveNew={(index) =>
              setNewVideos(newVideos.filter((_, i) => i !== index))
            }
          />
        </div>

        {/* Basic Info */}
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6">
          <ProductFormBasicInfo formData={formData} onChange={updateFormData} />

          <div className="mt-4">
            <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Description *
            </label>
            <div className="border border-theme-border-light dark:border-theme-border-dark rounded-lg overflow-hidden">
              <LazyJoditEditor
                ref={editor}
                value={formData.description}
                config={joditConfig}
                onBlur={(newContent) =>
                  updateFormData({ description: newContent })
                }
              />
            </div>
          </div>
        </div>

        {/* Categorization */}
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6 space-y-4">
          <h4 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark border-b border-theme-border-light dark:border-theme-border-dark pb-2">
            Categorization
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                Category *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) =>
                  updateFormData({ category_id: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => updateFormData({ tags: e.target.value })}
                placeholder="electronics, phone, mobile"
                className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>
          </div>
        </div>

        {/* Attributes */}
        {formData.category_id && (
          <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6">
            <ProductAttributeFields
              categoryId={formData.category_id}
              attributes={productAttributes}
              onAttributesChange={setProductAttributes}
            />
          </div>
        )}

        {/* Conditional: Simple Product Pricing & Inventory OR Variant Configuration */}
        {!hasVariants ? (
          <>
            {/* Pricing */}
            <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6">
              <ProductFormPricing formData={formData} onChange={updateFormData} />
            </div>

            {/* Inventory */}
            <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6 space-y-4">
              <h4 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark border-b border-theme-border-light dark:border-theme-border-dark pb-2">
                Inventory
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => updateFormData({ sku: e.target.value })}
                    required
                    disabled={mode === "edit"}
                    className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) =>
                      updateFormData({ stock_quantity: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.low_stock_threshold}
                    onChange={(e) =>
                      updateFormData({ low_stock_threshold: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Variant Configuration */}
            <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6">
              <VariantConfiguration
                variantOptions={variantOptions}
                variants={variants}
                onVariantOptionsChange={setVariantOptions}
                onVariantsChange={setVariants}
                basePrice={parseFloat(formData.price) || 0}
                baseSku={formData.sku || "PROD"}
                productCurrency="PKR"
              />
            </div>
          </>
        )}

        {/* SEO & Status */}
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6 space-y-4">
          <h4 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark border-b border-theme-border-light dark:border-theme-border-dark pb-2">
            SEO & Status
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => updateFormData({ meta_title: e.target.value })}
                className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => updateFormData({ status: e.target.value })}
                required
                className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Meta Description
            </label>
            <textarea
              value={formData.meta_description}
              onChange={(e) =>
                updateFormData({ meta_description: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
          </div>

          <div className="space-y-2">
            <h5 className="text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Product Badges
            </h5>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    updateFormData({ is_featured: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  Featured Product
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_bestseller}
                  onChange={(e) =>
                    updateFormData({ is_bestseller: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  Bestseller
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_on_sale}
                  onChange={(e) =>
                    updateFormData({ is_on_sale: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  On Sale
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_trending}
                  onChange={(e) =>
                    updateFormData({ is_trending: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  Trending
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-6 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImages || uploadingVideos}
            className="px-6 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? mode === "edit"
                ? "Updating..."
                : "Creating..."
              : uploadingImages
                ? "Uploading Images..."
                : uploadingVideos
                  ? "Uploading Videos..."
                  : mode === "edit"
                    ? "Update Product"
                    : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}