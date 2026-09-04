// app/(admin)/catalog/views/CatalogItemEditorView.tsx
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaPlus, FaTrash, FaListUl, FaSlidersH } from "react-icons/fa";
import { categoriesApi } from "../../../../lib/api/categories";
import { productsApi } from "../../../../lib/api/products";
import MediaAssetsManager from "../components/media/MediaAssetsManager";
import FinishMatrixStudio, { ColorItem } from "../components/matrix/FinishMatrixStudio";
import dynamic from "next/dynamic";
import Loader from "../../../components/shared/Loader";
import { VariantOption, ProductVariant } from "../../../../types/product-variants";

const LazyJoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

interface CatalogItemEditorViewProps {
  mode: "add" | "edit";
  productId?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function CatalogItemEditorView({ mode, productId }: CatalogItemEditorViewProps) {
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
  const [colorItems, setColorItems] = useState<any[]>([]);
  const [existingProduct, setExistingProduct] = useState<any>(null);

  const [attributesList, setAttributesList] = useState<{ key: string; value: string }[]>([]);

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
    stock_quantity: "",
    low_stock_threshold: "10",
    status: "draft",
    is_most_loved: false,
    is_premium: false,
    sku: "",
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
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getById(productId!);
      const p = data.product;
      setExistingProduct(p);

      setFormData({
        name: p.name || "",
        description: p.description || "",
        care_guide: p.care_guide || "",
        shipping_info: p.shipping_info || "",
        return_info: p.return_info || "",
        brand: p.brand || "",
        category_id: p.category_id?._id || p.category_id || "",
        price: p.pricing?.price?.toString() || "",
        compare_at_price: p.pricing?.compare_at_price?.toString() || "",
        stock_quantity: p.inventory?.stock_quantity?.toString() || "",
        low_stock_threshold: p.inventory?.low_stock_threshold?.toString() || "10",
        status: p.status || "draft",
        is_most_loved: Boolean(p.is_most_loved),
        is_premium: Boolean(p.is_premium),
        sku: p.sku || p.inventory?.sku || "",
      });

      setImages(p.images || []);
      setVideos(p.videos || []);

      const hasVars = p.hasVariants || (p.variantOptions && p.variantOptions.length > 0);
      setHasVariants(hasVars);

      if (hasVars) {
        setVariantOptions(p.variantOptions || []);
        setVariants(p.variants || []);
      }

      if (p.attributes && typeof p.attributes === "object") {
        const rawEntries = typeof p.attributes.entries === "function" 
          ? Array.from(p.attributes.entries()) 
          : Object.entries(p.attributes);
        const list = rawEntries.map(([k, v]) => ({
          key: String(k),
          value: String(v || ""),
        }));
        if (list.length > 0) {
          setAttributesList(list);
        }
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (files: File[]): Promise<any[]> => {
    const uploadedImages = [];
    for (const file of files) {
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      const response = await fetch("/api/products/upload-image", {
        method: "POST",
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        uploadedImages.push({
          url: data.url,
          alt_text: file.name,
          is_primary: false,
        });
      }
    }
    return uploadedImages;
  };

  const uploadVideoFiles = async (files: File[]): Promise<any[]> => {
    const uploadedVideos = [];
    for (const file of files) {
      const uploadFormData = new FormData();
      uploadFormData.append("video", file);

      const response = await fetch("/api/products/upload-video", {
        method: "POST",
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        uploadedVideos.push({
          url: data.url,
          public_id: data.public_id,
          format: data.format,
          duration: data.duration,
          width: data.width,
          height: data.height,
          bytes: data.bytes,
        });
      }
    }
    return uploadedVideos;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert("Please enter a product name");
      return;
    }
    if (!formData.category_id) {
      alert("Please select a category");
      return;
    }

    try {
      setLoading(true);

      let allImages = [...images];
      if (newImages.length > 0) {
        setUploadingImages(true);
        const uploaded = await uploadFiles(newImages);
        allImages = [...allImages, ...uploaded];
        setUploadingImages(false);
      }

      let allVideos = [...videos];
      if (newVideos.length > 0) {
        setUploadingVideos(true);
        const uploaded = await uploadVideoFiles(newVideos);
        allVideos = [...allVideos, ...uploaded];
        setUploadingVideos(false);
      }

      let preparedVariantOptions = [...variantOptions];
      let preparedVariants = [...variants];

      if (hasVariants && colorItems.length > 0) {
        const updatedColorOptIdx = preparedVariantOptions.findIndex(
          (opt) =>
            opt.name.toLowerCase() === "color" ||
            opt.displayName.toLowerCase() === "color"
        );

        const colorHexCodes: Record<string, string> = {};
        const colorImages: Record<string, string[]> = {};
        const colorVideos: Record<string, string[]> = {};

        for (const item of colorItems) {
          const colorName = item.name.trim();
          if (!colorName) continue;
          colorHexCodes[colorName] = item.hex;

          let finalImagesForColor = [...(item.existingImages || [])];
          if (item.newFiles && item.newFiles.length > 0) {
            setUploadingImages(true);
            const uploaded = await uploadFiles(item.newFiles);
            finalImagesForColor = [...finalImagesForColor, ...uploaded.map((u) => u.url)];
            setUploadingImages(false);
          }
          if (finalImagesForColor.length > 0) {
            colorImages[colorName] = finalImagesForColor;
          }

          let finalVideosForColor = [...(item.existingVideos || [])];
          if (item.newVideoFiles && item.newVideoFiles.length > 0) {
            setUploadingVideos(true);
            const uploadedVids = await uploadVideoFiles(item.newVideoFiles);
            finalVideosForColor = [...finalVideosForColor, ...uploadedVids.map((v) => v.url)];
            setUploadingVideos(false);
          }
          if (finalVideosForColor.length > 0) {
            colorVideos[colorName] = finalVideosForColor;
          }
        }

        const newColorOption: VariantOption = {
          name: "color",
          displayName: "Color",
          values: colorItems.map((c) => c.name.trim()).filter(Boolean),
          colorHexCodes,
          colorImages,
          colorVideos,
          position: 0,
        };

        if (updatedColorOptIdx >= 0) {
          preparedVariantOptions[updatedColorOptIdx] = newColorOption;
        } else {
          preparedVariantOptions.unshift(newColorOption);
        }

        preparedVariants = preparedVariants.map((v) => {
          const colorAttr = v.attributes?.find(
            (a) =>
              a.name?.toLowerCase() === "color" ||
              Boolean(colorImages[a.value])
          );
          if (colorAttr && colorImages[colorAttr.value] && colorImages[colorAttr.value].length > 0) {
            return {
              ...v,
              imageUrl: colorImages[colorAttr.value][0],
            };
          }
          return v;
        });

        // If top-level images are empty, auto-populate from finish photos
        if (allImages.length === 0) {
          const finishImgs: string[] = [];
          Object.values(colorImages).forEach((arr) => {
            if (Array.isArray(arr)) {
              arr.forEach((u) => {
                if (u && !finishImgs.includes(u)) finishImgs.push(u);
              });
            }
          });
          if (finishImgs.length > 0) {
            allImages = finishImgs.map((url, idx) => ({
              url,
              alt_text: `${formData.name} - ${idx + 1}`,
              is_primary: idx === 0,
            }));
          }
        }
      }

      const hasTopImages = allImages.length > 0;
      const hasTopVideos = allVideos.length > 0;
      const hasColorSectionMedia =
        hasVariants &&
        preparedVariantOptions.some((opt) => {
          const cImgs = opt.colorImages || {};
          const cVids = opt.colorVideos || {};
          const hasImgs = Object.values(cImgs).some((arr: any) => Array.isArray(arr) && arr.length > 0);
          const hasVids = Object.values(cVids).some((arr: any) => Array.isArray(arr) && arr.length > 0);
          return hasImgs || hasVids;
        });

      if (!hasTopImages && !hasTopVideos && !hasColorSectionMedia) {
        alert("Please upload at least one product photo or video in the Media Assets section or in the Color section below.");
        setLoading(false);
        return;
      }

      const attributesMap: Record<string, string> = {};
      attributesList.forEach((item) => {
        const k = item.key.trim();
        const v = item.value.trim();
        if (k && v) {
          attributesMap[k] = v;
        }
      });

      const productPayload: any = {
        name: formData.name,
        description: formData.description,
        care_guide: formData.care_guide,
        shipping_info: formData.shipping_info,
        return_info: formData.return_info,
        brand: formData.brand,
        category_id: formData.category_id,
        status: formData.status,
        is_most_loved: Boolean(formData.is_most_loved),
        is_premium: Boolean(formData.is_premium),
        images: allImages,
        videos: allVideos,
        hasVariants,
        attributes: attributesMap,
        shipping: existingProduct?.shipping || {
          requires_shipping: true,
          is_fragile: false,
          weight: 1,
          weight_unit: "kg",
        },
      };

      if (!hasVariants) {
        productPayload.sku = formData.sku?.trim() || undefined;
        productPayload.pricing = {
          price: parseFloat(formData.price) || 0,
          compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : undefined,
          currency: "PKR",
        };
        productPayload.inventory = {
          sku: formData.sku?.trim() || undefined,
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          low_stock_threshold: parseInt(formData.low_stock_threshold) || 10,
          stock_status: parseInt(formData.stock_quantity) > 0 ? "in_stock" : "out_of_stock",
        };
        productPayload.variantOptions = [];
        productPayload.variants = [];
      } else {
        // Pre-validate unique variant SKUs on client
        const variantSkus = preparedVariants
          .map((v) => (v.sku || "").trim())
          .filter(Boolean);
        const dupSku = variantSkus.find((s, idx) => variantSkus.indexOf(s) !== idx);
        if (dupSku) {
          alert(`Duplicate variant SKU "${dupSku}" found! Each variant must have a unique SKU.`);
          setLoading(false);
          return;
        }

        const prices = preparedVariants.map((v) => v.price).filter((p) => typeof p === "number" && !isNaN(p));
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const totalStock = preparedVariants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);

        productPayload.sku = formData.sku?.trim() || undefined;

        productPayload.pricing = {
          price: minPrice,
          currency: "PKR",
        };
        productPayload.inventory = {
          stock_quantity: totalStock,
          low_stock_threshold: parseInt(formData.low_stock_threshold) || 10,
          stock_status: totalStock > 0 ? "in_stock" : "out_of_stock",
        };
        productPayload.variantOptions = preparedVariantOptions;
        productPayload.variants = preparedVariants;
      }

      if (mode === "add") {
        await productsApi.create(productPayload);
        router.push("/admin/products");
      } else {
        await productsApi.update(productId!, productPayload);
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
      <div className="min-h-[300px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="p-2.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light hover:border-theme-hover-light transition-colors"
            title="Back to Products"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              {mode === "edit" ? "Edit Product" : "Create New Product"}
            </h1>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
              {mode === "edit"
                ? `Managing catalog product: ${formData.name || productId}`
                : "Create a new product with rich images, variants, and specifications."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-4 py-2 text-xs font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg hover:bg-theme-card-light dark:hover:bg-theme-card-dark transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || uploadingImages || uploadingVideos}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold tracking-wide shadow-xs hover:shadow active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {loading
              ? mode === "edit" ? "Updating..." : "Creating..."
              : uploadingImages
                ? "Uploading Images..."
                : uploadingVideos
                  ? "Uploading Videos..."
                  : mode === "edit" ? "Save Changes" : "Publish Product"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Unified Visual Media Assets (Photos & Videos) */}
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-6 space-y-4">
          <MediaAssetsManager
            images={images}
            newImages={newImages}
            onImageSelect={(files) => setNewImages([...newImages, ...files])}
            onRemoveExistingImage={(index) => {
              setImages(images.filter((_, i) => i !== index));
            }}
            onRemoveNewImage={(index) => {
              setNewImages(newImages.filter((_, i) => i !== index));
            }}
            onSetPrimaryImage={(index) => {
              setImages(
                images.map((img, i) => ({
                  ...img,
                  is_primary: i === index,
                }))
              );
            }}
            videos={videos}
            newVideos={newVideos}
            onVideoSelect={(files) => setNewVideos([...newVideos, ...files])}
            onRemoveExistingVideo={(index) => setVideos(videos.filter((_, i) => i !== index))}
            onRemoveNewVideo={(index) => setNewVideos(newVideos.filter((_, i) => i !== index))}
            colorItems={colorItems}
          />
        </div>

        {/* 3. Essential Product Information */}
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-6 space-y-5">
          <div className="border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3">
            <h3 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Basic Information & Specifications
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
              Title, brand, categorization, and comprehensive editorial description.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Minimalist Wooden Table Lamp"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                required
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                Primary Category *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => updateFormData({ category_id: e.target.value })}
                required
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
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

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Editorial Product Description *
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
        </div>

        {/* Technical Specifications & Craftsmanship Attributes Studio */}
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <FaSlidersH className="w-3.5 h-3.5 text-theme-hover-light dark:text-theme-hover-dark" />
                <h3 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  Technical Specifications & Attributes ({attributesList.length})
                </h3>
              </div>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
                Technical parameters displayed in the customer storefront specification table (Material, Dimensions, Voltage, Socket, Finish, etc.).
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setAttributesList((prev) => [...prev, { key: "", value: "" }]);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold rounded-lg transition-colors self-start sm:self-auto shrink-0"
            >
              <FaPlus className="w-3 h-3" />
              <span>Add Specification</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {attributesList.map((attr, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-theme-border-light/70 dark:border-theme-border-dark/70 bg-theme-bg-light/50 dark:bg-theme-bg-dark/40 flex flex-col sm:flex-row sm:items-center gap-2.5"
              >
                <div className="w-full sm:w-1/3">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark mb-1">
                    Specification Name / Key
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. material, bulb_socket, dimensions"
                    value={attr.key}
                    onChange={(e) => {
                      const updated = [...attributesList];
                      updated[idx].key = e.target.value;
                      setAttributesList(updated);
                    }}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-theme-border-light dark:border-theme-border-dark rounded-md bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="w-full sm:flex-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark mb-1">
                    Specification Detail / Value
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Solid American Walnut & Natural Oak"
                    value={attr.value}
                    onChange={(e) => {
                      const updated = [...attributesList];
                      updated[idx].value = e.target.value;
                      setAttributesList(updated);
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-md bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAttributesList((prev) => prev.filter((_, i) => i !== idx));
                  }}
                  title="Remove this specification"
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors self-end sm:self-center mt-1 sm:mt-5"
                >
                  <FaTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {attributesList.length === 0 && (
              <div className="text-center py-6 border border-dashed border-theme-border-light dark:border-theme-border-dark rounded-lg">
                <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  No technical specifications configured yet. Click "Add Specification" to add parameters.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Product Type & Variant Mode Selector */}
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Multiple Finishes & Variant Options
              </h3>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
                Enable to build color swatches, finishes, sizes, and independent variant prices/stock.
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {mode === "edit" && (
            <p className="text-[11px] text-theme-text-muted-light mt-2">
              Note: Structure configuration type is locked after product creation.
            </p>
          )}
        </div>

        {/* 5. Simple Product Pricing & Inventory (When not variable) */}
        {!hasVariants && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Simple Pricing Card */}
            <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-6 space-y-4">
              <div className="border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-2">
                <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  Pricing Information
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                    Selling Price (PKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => updateFormData({ price: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                    Compare at Price (PKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Original MSRP"
                    value={formData.compare_at_price}
                    onChange={(e) => updateFormData({ compare_at_price: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>
            </div>

            {/* Simple Inventory Card */}
            <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-6 space-y-4">
              <div className="border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-2">
                <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  Stock & SKU Identification
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                    Product SKU
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TL-001"
                    value={formData.sku}
                    onChange={(e) => updateFormData({ sku: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 text-xs font-mono uppercase border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.stock_quantity}
                    onChange={(e) => updateFormData({ stock_quantity: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="10"
                    value={formData.low_stock_threshold}
                    onChange={(e) => updateFormData({ low_stock_threshold: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. Variable Product Matrix Engine */}
        {hasVariants && (
          <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-6">
            <FinishMatrixStudio
              variantOptions={variantOptions}
              variants={variants}
              onVariantOptionsChange={setVariantOptions}
              onVariantsChange={setVariants}
              basePrice={parseFloat(formData.price) || 0}
              productCurrency="PKR"
              colorItems={colorItems}
              onColorItemsChange={setColorItems}
            />
          </div>
        )}

        {/* 7. Publishing & Visibility Status + Homepage Showcase Tags */}
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-6 space-y-5">
          <div className="border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-2">
            <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Catalog Visibility & Homepage Showcase
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
              Control general catalog publication and choose which homepage curated sections this product appears in.
            </p>
          </div>

          <div className="max-w-xs">
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Publication Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => updateFormData({ status: e.target.value })}
              required
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
            >
              <option value="draft">Draft (Hidden from storefront)</option>
              <option value="active">Active (Live in customer catalog)</option>
              <option value="archived">Archived (Delisted from catalog)</option>
            </select>
          </div>

          {/* Homepage Curated Showcase Tags */}
          <div className="pt-3 border-t border-theme-border-light/60 dark:border-theme-border-dark/60 space-y-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A8752B] dark:text-[#C59345]">
                Homepage Showcase Sections
              </h4>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
                Tag this product to be featured in the animated homepage product sections. Products automatically rotate every 5 seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Most Loved Tag */}
              <label className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all select-none ${
                formData.is_most_loved
                  ? "bg-[#C59345]/10 border-[#C59345] shadow-xs"
                  : "bg-theme-bg-light/50 dark:bg-theme-bg-dark/50 border-theme-border-light dark:border-theme-border-dark hover:border-[#C59345]/50"
              }`}>
                <input
                  type="checkbox"
                  checked={formData.is_most_loved}
                  onChange={(e) => updateFormData({ is_most_loved: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-[#C59345] border-gray-300 rounded focus:ring-[#C59345] cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Most Loved by Our Customers
                  </span>
                  <span className="block text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
                    Displays in the &ldquo;MOST LOVED BY OUR CUSTOMERS&rdquo; section on the home page.
                  </span>
                </div>
              </label>

              {/* Premium Collection Tag */}
              <label className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all select-none ${
                formData.is_premium
                  ? "bg-[#C59345]/10 border-[#C59345] shadow-xs"
                  : "bg-theme-bg-light/50 dark:bg-theme-bg-dark/50 border-theme-border-light dark:border-theme-border-dark hover:border-[#C59345]/50"
              }`}>
                <input
                  type="checkbox"
                  checked={formData.is_premium}
                  onChange={(e) => updateFormData({ is_premium: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-[#C59345] border-gray-300 rounded focus:ring-[#C59345] cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Premium Collection
                  </span>
                  <span className="block text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
                    Displays in the &ldquo;PREMIUM COLLECTION&rdquo; section on the home page.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="sticky bottom-4 z-20 bg-theme-surface-light/95 dark:bg-theme-surface-dark/95 backdrop-blur-md p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark shadow-xl flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-4 py-2 text-xs font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg hover:bg-theme-card-light transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || uploadingImages || uploadingVideos}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-lg text-xs font-semibold tracking-wide shadow-xs hover:shadow active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
