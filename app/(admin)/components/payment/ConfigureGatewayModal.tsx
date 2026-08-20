// // app/(admin)/components/payment/ConfigureGatewayModal.tsx
"use client";

import { useState } from "react";
import { X, AlertCircle, DollarSign } from "lucide-react";

interface ConfigureGatewayModalProps {
  gateway: any;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export default function ConfigureGatewayModal({
  gateway,
  onClose,
  onSave,
}: ConfigureGatewayModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: gateway?.name || "",
    display_name: gateway?.display_name || "",
    is_enabled: gateway?.is_enabled || false,
    is_test_mode: gateway?.is_test_mode ?? true,
    credentials: {
      account_name: gateway?.credentials?.account_name || "",
      account_number: gateway?.credentials?.account_number || "",
      iban: gateway?.credentials?.iban || "",
      bank_name: gateway?.credentials?.bank_name || "",
      instructions: gateway?.credentials?.instructions || "",
      qr_code_image: gateway?.credentials?.qr_code_image || "",
    },
    settings: {
      currency: gateway?.settings?.currency || "USD",
      accepted_currencies: gateway?.settings?.accepted_currencies || ["USD"],
      payment_description: gateway?.settings?.payment_description || "",
      min_order_amount: gateway?.settings?.min_order_amount || 0,
      max_order_amount: gateway?.settings?.max_order_amount || null,
      allow_all_orders: gateway?.settings?.allow_all_orders ?? true,
      instructions: gateway?.settings?.instructions || "",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCredentialFields = () => {
    if (formData.name === "bank_transfer") {
      return (
        <>
          <div>
            <label htmlFor="account_name" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Account Holder Name *
            </label>
            <input
              id="account_name"
              type="text"
              value={formData.credentials.account_name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  credentials: {
                    ...formData.credentials,
                    account_name: e.target.value,
                  },
                })
              }
              required
              placeholder="John Doe"
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="account_number" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Account Number *
            </label>
            <input
              id="account_number"
              type="text"
              value={formData.credentials.account_number}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  credentials: {
                    ...formData.credentials,
                    account_number: e.target.value,
                  },
                })
              }
              required
              placeholder="1234567890"
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="iban" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              IBAN
            </label>
            <input
              id="iban"
              type="text"
              value={formData.credentials.iban}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  credentials: {
                    ...formData.credentials,
                    iban: e.target.value,
                  },
                })
              }
              placeholder="PK36SCBL0000001123456702"
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="bank_name" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Bank Name *
            </label>
            <input
              id="bank_name"
              type="text"
              value={formData.credentials.bank_name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  credentials: {
                    ...formData.credentials,
                    bank_name: e.target.value,
                  },
                })
              }
              required
              placeholder="State Bank of Pakistan"
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="bank_instructions" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Transfer Instructions
            </label>
            <textarea
              id="bank_instructions"
              value={formData.credentials.instructions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  credentials: {
                    ...formData.credentials,
                    instructions: e.target.value,
                  },
                })
              }
              rows={3}
              placeholder="Please include your order number in the transfer reference."
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm resize-none"
            />
          </div>

          <div>
            <label htmlFor="qr_code_image" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              QR Code Image URL (Optional)
            </label>
            <input
              id="qr_code_image"
              type="text"
              value={formData.credentials.qr_code_image}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  credentials: {
                    ...formData.credentials,
                    qr_code_image: e.target.value,
                  },
                })
              }
              placeholder="https://example.com/qr-code.png"
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
            />
          </div>
        </>
      );
    }

    if (formData.name === "cod") {
      return (
        <>
          <div>
            <label htmlFor="allow_all_orders" className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                id="allow_all_orders"
                type="checkbox"
                checked={formData.settings.allow_all_orders}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      allow_all_orders: e.target.checked,
                      min_order_amount: e.target.checked ? 0 : formData.settings.min_order_amount,
                      max_order_amount: e.target.checked ? null : formData.settings.max_order_amount,
                    },
                  })
                }
                className="w-4 h-4 text-theme-primary rounded focus:ring-theme-primary"
              />
              <span className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Allow COD for all order amounts
              </span>
            </label>
          </div>

          {!formData.settings.allow_all_orders && (
            <>
              <div>
                <label htmlFor="min_order_amount" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                  Minimum Order Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark sm:w-4 sm:h-4" aria-hidden="true" />
                  <input
                    id="min_order_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.settings.min_order_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          min_order_amount: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    placeholder="0.00"
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="max_order_amount" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                  Maximum Order Amount (Optional)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark sm:w-4 sm:h-4" size={16} aria-hidden="true" />
                  <input
                    id="max_order_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.settings.max_order_amount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          max_order_amount: e.target.value ? parseFloat(e.target.value) : null,
                        },
                      })
                    }
                    placeholder="No limit"
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
                  />
                </div>
                <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                  Leave empty for no maximum limit
                </p>
              </div>
            </>
          )}

          <div>
            <label htmlFor="cod_instructions" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Payment Instructions (Optional)
            </label>
            <textarea
              id="cod_instructions"
              value={formData.settings.instructions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  settings: {
                    ...formData.settings,
                    instructions: e.target.value,
                  },
                })
              }
              rows={3}
              placeholder="Please keep the exact amount ready. Our delivery partner will collect payment upon delivery."
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm resize-none"
            />
          </div>
        </>
      );
    }

    return null;
  };

  const titleId = "configure-gateway-title";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-3 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg sm:rounded-xl w-full max-w-lg md:max-w-2xl max-h-[95vh] flex flex-col mx-2 sm:mx-auto">
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-theme-border-light dark:border-theme-border-dark flex-shrink-0">
          <h2 id={titleId} className="text-lg sm:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
            Configure {formData.display_name}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-theme-text-muted-light hover:text-theme-text-primary-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-primary-dark p-1"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <div className="space-y-4 sm:space-y-6">
            {formData.name !== "cod" && (
              <div className="flex gap-2 sm:gap-3 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5" size={16} aria-hidden="true" />
                <div className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium mb-1">Secure Your Credentials</p>
                  <p className="break-words">Never share your API keys. These credentials grant access to your payment gateway.</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3 sm:mb-4">
                Basic Settings
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="display_name" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                    Display Name
                  </label>
                  <input
                    id="display_name"
                    type="text"
                    value={formData.display_name}
                    onChange={(e) =>
                      setFormData({ ...formData, display_name: e.target.value })
                    }
                    required
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {formData.name !== "cod" && (
                    <label htmlFor="is_test_mode" className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                      <input
                        id="is_test_mode"
                        type="checkbox"
                        checked={formData.is_test_mode}
                        onChange={(e) =>
                          setFormData({ ...formData, is_test_mode: e.target.checked })
                        }
                        className="w-4 h-4 text-theme-primary rounded focus:ring-theme-primary"
                      />
                      <span className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        Test Mode
                      </span>
                    </label>
                  )}

                  <label htmlFor="is_enabled" className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                    <input
                      id="is_enabled"
                      type="checkbox"
                      checked={formData.is_enabled}
                      onChange={(e) =>
                        setFormData({ ...formData, is_enabled: e.target.checked })
                      }
                      className="w-4 h-4 text-theme-primary rounded focus:ring-theme-primary"
                    />
                    <span className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      Enable Gateway
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {formData.name !== "cod" && (
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3 sm:mb-4">
                  API Credentials
                </h3>
                <div className="space-y-3 sm:space-y-4">{renderCredentialFields()}</div>
              </div>
            )}

            {formData.name === "cod" && (
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3 sm:mb-4">
                  COD Settings
                </h3>
                <div className="space-y-3 sm:space-y-4">{renderCredentialFields()}</div>
              </div>
            )}

            {formData.name !== "cod" && (
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3 sm:mb-4">
                  Payment Settings
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label htmlFor="currency" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                      Currency
                    </label>
                    <select
                      id="currency"
                      value={formData.settings.currency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          settings: { ...formData.settings, currency: e.target.value },
                        })
                      }
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="payment_description" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                      Payment Description (Optional)
                    </label>
                    <input
                      id="payment_description"
                      type="text"
                      value={formData.settings.payment_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            payment_description: e.target.value,
                          },
                        })
                      }
                      placeholder="Payment for order #123"
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 border-t border-theme-border-light dark:border-theme-border-dark flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark text-theme-text-primary-light dark:text-theme-text-primary-dark rounded-lg hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors text-xs sm:text-sm w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm w-full sm:w-auto"
          >
            {loading ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}