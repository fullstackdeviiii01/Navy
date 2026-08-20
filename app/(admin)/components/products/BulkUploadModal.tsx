// app/(admin)/components/products/BulkUploadModal.tsx
"use client";

import { useState } from "react";
import {
  FaTimes,
  FaFileUpload,
  FaDownload,
  FaCheckCircle,
  FaTimesCircle,
  FaFileCsv,
  FaFileExcel,
} from "react-icons/fa";
import { productsApi } from "../../../../lib/api/products";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [uploadType, setUploadType] = useState<"csv" | "excel">("excel");

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();

      // Auto-detect file type
      if (fileExtension === "csv") {
        setUploadType("csv");
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        setUploadType("excel");
      }

      setFile(selectedFile);
      setResults(null);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());
    const products = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(",");
      const product: any = {};

      headers.forEach((header, index) => {
        const value = values[index]?.trim() || "";
        product[header] = value;
      });

      // Convert numeric fields
      if (product.price) product.price = parseFloat(product.price);
      if (product.compare_at_price)
        product.compare_at_price = parseFloat(product.compare_at_price);
      if (product.stock_quantity)
        product.stock_quantity = parseInt(product.stock_quantity);
      if (product.low_stock_threshold)
        product.low_stock_threshold = parseInt(product.low_stock_threshold);
      if (product.weight) product.weight = parseFloat(product.weight);

      products.push(product);
    }

    return products;
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResults(null);

    try {
      if (uploadType === "csv") {
        // CSV Upload
        const text = await file.text();
        const products = parseCSV(text);
        const data = await productsApi.bulkUpload(products);
        setResults(data.results);

        if (data.results.success.length > 0) {
          onSuccess();
        }
      } else {
        // Excel Upload
        const data = await productsApi.bulkUploadExcel(file);
        setResults(data.results);

        if (data.results.success.length > 0) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    if (uploadType === "csv") {
      // CSV Template
      const csvContent = `name,description,short_description,brand,manufacturer,category_slug,price,compare_at_price,cost_per_item,currency,sku,stock_quantity,low_stock_threshold,track_inventory,allow_backorder,weight,weight_unit,requires_shipping,is_fragile,tags,status,is_featured,is_trending,is_on_sale,is_bestseller,is_visible,visibility,meta_title,meta_description,meta_keywords,unit_of_measure
Sample Product,This is a sample product description,Short description here,Brand Name,Manufacturer Name,electronics,99.99,129.99,50.00,USD,SKU-12345,100,10,true,false,2.5,kg,true,false,"electronics,gadget,tech",active,true,false,true,false,true,public,Sample Product Meta Title,Sample product meta description,electronics;gadget;tech,piece`;

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "product_bulk_upload_template.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert(
        "Excel template download: Create an Excel file with the same columns as CSV template. You can embed images directly in the Excel file by inserting them into cells."
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Bulk Product Upload
          </h3>
          <button
            onClick={onClose}
            className="text-theme-text-muted-light hover:text-theme-hover-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-secondary-dark"
          >
            <FaTimes />
          </button>
        </div>

        {/* Upload Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-3">
            Select Upload Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setUploadType("excel")}
              className={`p-4 border-2 rounded-lg transition-all ${
                uploadType === "excel"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-theme-border-light dark:border-theme-border-dark hover:border-blue-300"
              }`}
            >
              <FaFileExcel
                className={`mx-auto mb-2 text-3xl ${
                  uploadType === "excel"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              />
              <div className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Excel Upload
              </div>
              <div className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                Supports embedded images
              </div>
            </button>

            <button
              onClick={() => setUploadType("csv")}
              className={`p-4 border-2 rounded-lg transition-all ${
                uploadType === "csv"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-theme-border-light dark:border-theme-border-dark hover:border-blue-300"
              }`}
            >
              <FaFileCsv
                className={`mx-auto mb-2 text-3xl ${
                  uploadType === "csv"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              />
              <div className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                CSV Upload
              </div>
              <div className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                Text data only
              </div>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Instructions:
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
            {uploadType === "excel" ? (
              <>
                <li>Download the template or create an Excel file with required columns</li>
                <li>Fill in product data in the spreadsheet</li>
                <li>
                  <strong>To add images:</strong> Insert images directly into Excel cells
                  (Insert → Pictures). Images will be automatically extracted and linked to
                  products in the same row
                </li>
                <li>Make sure category slugs exist in your system</li>
                <li>Upload the completed Excel file</li>
              </>
            ) : (
              <>
                <li>Download the CSV template</li>
                <li>Fill in product data (text only - images not supported in CSV)</li>
                <li>Make sure category slugs exist in your system</li>
                <li>Upload the completed CSV file</li>
              </>
            )}
          </ol>
        </div>

        {/* Template Download */}
        {/* <div className="mb-6">
          <button
            onClick={downloadTemplate}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaDownload className="mr-2" />
            Download {uploadType === "excel" ? "Excel" : "CSV"} Template
          </button>
        </div> */}

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
            Upload {uploadType === "excel" ? "Excel" : "CSV"} File
          </label>
          <div className="mt-1 flex items-center">
            <input
              type="file"
              accept={uploadType === "excel" ? ".xlsx,.xls" : ".csv"}
              onChange={handleFileChange}
              className="block w-full text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                dark:file:bg-blue-900 dark:file:text-blue-200"
            />
          </div>
          {file && (
            <div className="mt-2 flex items-center space-x-2">
              <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Selected: {file.name}
              </p>
              {uploadType === "excel" && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Images Supported
                </span>
              )}
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="mb-6">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex items-center px-6 py-3 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaFileUpload className="mr-2" />
            {uploading ? "Uploading..." : "Upload Products"}
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {results.total}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Total Rows
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {results.success.length}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Successful
                </div>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {results.failed.length}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">
                  Failed
                </div>
              </div>
            </div>

            {/* Success List */}
            {results.success.length > 0 && (
              <div className="max-h-48 overflow-y-auto">
                <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center">
                  <FaCheckCircle className="mr-2" />
                  Successful Uploads
                </h4>
                <div className="space-y-2">
                  {results.success.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded"
                    >
                      Row {item.row}: {item.name} (SKU: {item.sku})
                      {item.imagesCount > 0 && (
                        <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                          • {item.imagesCount} image(s)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed List */}
            {results.failed.length > 0 && (
              <div className="max-h-48 overflow-y-auto">
                <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2 flex items-center">
                  <FaTimesCircle className="mr-2" />
                  Failed Uploads
                </h4>
                <div className="space-y-2">
                  {results.failed.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded"
                    >
                      <div className="font-medium">Row {item.row}</div>
                      <div className="text-red-600 dark:text-red-400">
                        {item.error}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}