"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { categoriesApi } from "../../../../lib/api/categories";
import { productsApi } from "../../../../lib/api/products";
import ProductFormImages from "../../components/products/form/ProductFormImages";
import ProductFormVideos from "../../components/products/form/ProductFormVideos";
import VariantConfiguration from "../../components/products/form/VariantConfiguration";
import dynamic from "next/dynamic";
import Loader from "../../../components/shared/Loader";
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

export default function ProductFormPage({ mode, productId }: ProductFormPageProps) {
  const router = useRouter();
  const editor = useRef(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [newVideos, setNewVideos] = useState<File[]>([]);

  const [hasVariants, setHasVariants] = useState(false);
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    care_guide: "",
    shipping_info: "",
    return_info: "",
    brand: "",
    category_id: "",
    price: "",
    compare_at_price: "",
    sku: "",
    stock_quantity: "",
    low_stock_threshold: "10",
    status: "draft",
  });

  const [images, setImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  const joditConfig = useMemo(
    () => ({
      readonly: false,
      placeholder: "Enter detailed product description...",
      minHeight: 300,
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
        "bold", "italic", "underline", "|",
        "ul", "ol", "|",
        "font", "fontsize", "paragraph", "|",
        "align", "|",
        "link", "table", "|",
        "undo", "redo", "|",
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
        care_guide: product.care_guide || "",
        shipping_info: product.shipping_info || "",
        return_info: product.return_info || "",
        brand: product.brand || "",
        category_id: product.category_id?._id || product.category_id || "",
        price: product.pricing?.price?.toString() || "",
        compare_at_price: product.pricing?.compare_at_price?.toString() || "",
        sku: product.inventory?.sku || "",
        stock_quantity: product.inventory?.stock_quantity?.toString() || "",
        low_stock_threshold: product.inventory?.low_stock_threshold?.toString() || "10",
        status: product.status || "draft",
      });

      setImages(product.images || []);
      setVideos(product.videos || []);
      setHasVariants(product.hasVariants || false);
      setVariantOptions(product.variantOptions || []);
      setVariants(product.variants || []);
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
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

    if (hasVariants) {
      if (variantOptions.length === 0) {
        alert("Add at least one variant option (e.g. Color, Size)");
        return;
      }
      if (variantOptions.some((opt) => opt.values.length === 0)) {
        alert("All variant options must have at least one value");
        return;
      }
      if (variants.length === 0) {
        alert("No variants generated. Configure your options properly");
        return;
      }
      if (variants.some((v) => !v.sku || !v.sku.trim())) {
        alert("All variants must have a SKU");
        return;
      }
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
          ? undefined
          : `${baseSlug}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const productData: any = {
        name: formData.name.trim(),
        description: formData.description,
        care_guide: formData.care_guide?.trim() || undefined,
        shipping_info: formData.shipping_info?.trim() || undefined,
        return_info: formData.return_info?.trim() || undefined,
        brand: formData.brand?.trim() || undefined,
        category_id: formData.category_id,
        subcategory_ids: [],
        seo: {
          slug,
          meta_title: formData.name.trim(),
          meta_description: "",
        },
        status: formData.status,
        is_visible: true,
        visibility: "public",
        images: allImages,
        videos: allVideos,
        hasVariants,
      };

      if (hasVariants) {
        productData.variantOptions = variantOptions;
        productData.variants = variants;
        const uniqueBaseSku = `${formData.sku || `PROD-${Date.now()}`}-BASE`;
        productData.pricing = { price: 0, currency: "PKR" };
        productData.inventory = {
          sku: uniqueBaseSku,
          stock_quantity: 0,
          low_stock_threshold: 10,
          track_inventory: true,
          allow_backorder: false,
          stock_status: "in_stock",
        };
      } else {
        const stockQty = parseInt(formData.stock_quantity) || 0;
        const lowThreshold = parseInt(formData.low_stock_threshold) || 10;
        let stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "discontinued" = "in_stock";
        if (stockQty === 0) stockStatus = "out_of_stock";
        else if (stockQty <= lowThreshold) stockStatus = "low_stock";

        productData.pricing = {
          price: parseFloat(formData.price),
          compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : undefined,
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
        productData.variantOptions = [];
        productData.variants = [];
      }

      if (mode === "edit" && productId) {
        await productsApi.update(productId, productData);
        alert("Product updated successfully");
        router.push(`/admin/products/${productId}`);
      } else {
        await productsApi.create(productData);
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
        {/* Images */}
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6">
          <h4 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark border-b border-theme-border-light dark:border-theme-border-dark pb-2 mb-4">
            Product Images
          </h4>
          <ProductFormImages
            images={images}
            newImages={newImages}
            onImageSelect={(files) => setNewImages([...newImages, ...files])}
            onRemoveExisting={(index) => {
              if (images.length + newImages.length <= 1) {
                alert("At least one image is required.");
                return;
              }
              setImages(images.filter((_, i) => i !== index));
            }}
            onRemoveNew={(index) => {
              if (images.length + newImages.length <= 1) {
                alert("At least one image is required.");
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
            onRemoveExisting={(index) => setVideos(videos.filter((_, i) => i !== index))}
            onRemoveNew={(index) => setNewVideos(newVideos.filter((_, i) => i !== index))}
          />
        </div>

        {/* Basic Information */}
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6 space-y-4">
          <h4 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark border-b border-theme-border-light dark:border-theme-border-dark pb-2">
            Basic Information
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => updateFormData({ brand: e.target.value })}
                className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Description *
            </label>
            <div className="border border-theme-border-light dark:border-theme-border-dark rounded-lg overflow-hidden">
              <LazyJoditEditor
                ref={editor}
                value={formData.description}
                config={joditConfig}
                onBlur={(newContent) => updateFormData({ description: newContent })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                Care Guide
              </label>
              <textarea
                value={formData.care_guide}
                onChange={(e) => updateFormData({ care_guide: e.target.value })}
                rows={3}
                placeholder="e.g., Wipe with a soft dry cloth. Avoid harsh chemicals."
                className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                Shipping Info
              </label>
              <textarea
                value={formData.shipping_info}
                onChange={(e) => updateFormData({ shipping_info: e.target.value })}
                rows={3}
                placeholder="e.g., Free shipping on orders over Rs. 5000."
                className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                Return Info
              </label>
              <textarea
                value={formData.return_info}
                onChange={(e) => updateFormData({ return_info: e.target.value })}
                rows={3}
                placeholder="e.g., 7-day return policy for unused items."
                className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Category *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => updateFormData({ category_id: e.target.value })}
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
        </div>

        {/* Product Type Toggle */}
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Product Variants
              </h4>
              <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                Enable if this product has options like size, color, material
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => {
                  if (mode === "edit") return;
                  setHasVariants(e.target.checked);
                  if (!e.target.checked) {
                    setVariantOptions([]);
                    setVariants([]);
                  }
                }}
                disabled={mode === "edit"}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-theme-primary rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-primary"></div>
            </label>
          </div>

          {mode === "edit" && (
            <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-2">
              Product type cannot be changed after creation.
            </p>
          )}
        </div>

        {/* Simple Product: Pricing & Inventory */}
        {!hasVariants && (
          <>
            <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6 space-y-4">
              <h4 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark border-b border-theme-border-light dark:border-theme-border-dark pb-2">
                Pricing
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => updateFormData({ price: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                    Compare at Price (PKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.compare_at_price}
                    onChange={(e) => updateFormData({ compare_at_price: e.target.value })}
                    className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  />
                </div>
              </div>
            </div>

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
                    onChange={(e) => updateFormData({ stock_quantity: e.target.value })}
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
                    onChange={(e) => updateFormData({ low_stock_threshold: e.target.value })}
                    className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Variant Product: Variant Configuration */}
        {hasVariants && (
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
        )}

        {/* Status */}
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6 space-y-4">
          <h4 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark border-b border-theme-border-light dark:border-theme-border-dark pb-2">
            Status
          </h4>

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
              ? mode === "edit" ? "Updating..." : "Creating..."
              : uploadingImages
                ? "Uploading Images..."
                : uploadingVideos
                  ? "Uploading Videos..."
                  : mode === "edit" ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
