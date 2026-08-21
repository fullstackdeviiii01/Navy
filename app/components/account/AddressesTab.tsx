// app/components/account/AddressesTab.tsx
"use client";

import { useState, useEffect } from "react";
import { MapPin, CreditCard, Save } from "lucide-react";

interface AddressesTabProps {
  dbUser: any;
  authUser: any;
  refreshUser: () => Promise<void>;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  updating: boolean;
  setUpdating: (updating: boolean) => void;
}

export default function AddressesTab({
  dbUser,
  refreshUser,
  setError,
  setSuccess,
  updating,
  setUpdating,
}: AddressesTabProps) {
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const [shipping, setShipping] = useState({
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Pakistan",
  });

  const [billing, setBilling] = useState({
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Pakistan",
  });

  useEffect(() => {
    if (dbUser?.addresses && dbUser.addresses.length > 0) {
      const ship = dbUser.addresses.find((a: any) => a.type === "shipping");
      const bill = dbUser.addresses.find((a: any) => a.type === "billing");

      if (ship) {
        setShipping({
          full_name: ship.full_name || dbUser.name || "",
          phone: ship.phone || dbUser.phone || "",
          line1: ship.line1 || "",
          line2: ship.line2 || "",
          city: ship.city || "",
          state: ship.state || "",
          postal_code: ship.postal_code || "",
          country: ship.country || "Pakistan",
        });
      } else {
        setShipping((prev) => ({
          ...prev,
          full_name: dbUser.name || "",
          phone: dbUser.phone || "",
        }));
      }

      if (bill) {
        setBilling({
          full_name: bill.full_name || dbUser.name || "",
          phone: bill.phone || dbUser.phone || "",
          line1: bill.line1 || "",
          line2: bill.line2 || "",
          city: bill.city || "",
          state: bill.state || "",
          postal_code: bill.postal_code || "",
          country: bill.country || "Pakistan",
        });
        setSameAsShipping(false);
      } else {
        setSameAsShipping(true);
      }
    } else if (dbUser) {
      setShipping((prev) => ({
        ...prev,
        full_name: dbUser.name || "",
        phone: dbUser.phone || "",
      }));
    }
  }, [dbUser]);

  const handleSaveAddresses = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/users/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress: shipping,
          billingAddress: sameAsShipping ? shipping : billing,
          sameAsShipping,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save address details");
      }

      setSuccess("Delivery & Billing addresses updated successfully.");
      await refreshUser();
    } catch (err: any) {
      setError(err.message || "Failed to update address details");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#3D2C15]">
        <MapPin size={18} className="text-[#D4A359]" />
        <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#F3EBDC]">
          DELIVERY & BILLING ADDRESSES
        </h2>
      </div>

      <form onSubmit={handleSaveAddresses} className="space-y-8">
        {/* ── 1. SHIPPING ADDRESS ────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#D4A359]">
              1. SHIPPING ADDRESS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#D7D3CF]/70 mb-1.5">
                RECIPIENT FULL NAME *
              </label>
              <input
                type="text"
                value={shipping.full_name}
                onChange={(e) =>
                  setShipping({ ...shipping, full_name: e.target.value })
                }
                required
                className="w-full bg-[#180F05] border border-[#3D2C15] px-4 py-3 text-xs sm:text-sm text-[#F3EBDC] focus:outline-none focus:border-[#D4A359]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#D7D3CF]/70 mb-1.5">
                PHONE NUMBER *
              </label>
              <input
                type="tel"
                value={shipping.phone}
                onChange={(e) =>
                  setShipping({ ...shipping, phone: e.target.value })
                }
                required
                placeholder="+92 300 0000000"
                className="w-full bg-[#180F05] border border-[#3D2C15] px-4 py-3 text-xs sm:text-sm text-[#F3EBDC] focus:outline-none focus:border-[#D4A359]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#D7D3CF]/70 mb-1.5">
                STREET ADDRESS *
              </label>
              <input
                type="text"
                value={shipping.line1}
                onChange={(e) =>
                  setShipping({ ...shipping, line1: e.target.value })
                }
                required
                placeholder="House / Apartment #, Street, Area"
                className="w-full bg-[#180F05] border border-[#3D2C15] px-4 py-3 text-xs sm:text-sm text-[#F3EBDC] focus:outline-none focus:border-[#D4A359]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#D7D3CF]/70 mb-1.5">
                APARTMENT, SUITE, LANDMARK (OPTIONAL)
              </label>
              <input
                type="text"
                value={shipping.line2}
                onChange={(e) =>
                  setShipping({ ...shipping, line2: e.target.value })
                }
                placeholder="Near landmark or apartment name"
                className="w-full bg-[#180F05] border border-[#3D2C15] px-4 py-3 text-xs sm:text-sm text-[#F3EBDC] focus:outline-none focus:border-[#D4A359]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#D7D3CF]/70 mb-1.5">
                CITY *
              </label>
              <input
                type="text"
                value={shipping.city}
                onChange={(e) =>
                  setShipping({ ...shipping, city: e.target.value })
                }
                required
                placeholder="e.g. Lahore, Karachi, Islamabad"
                className="w-full bg-[#180F05] border border-[#3D2C15] px-4 py-3 text-xs sm:text-sm text-[#F3EBDC] focus:outline-none focus:border-[#D4A359]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#D7D3CF]/70 mb-1.5">
                PROVINCE / STATE *
              </label>
              <input
                type="text"
                value={shipping.state}
                onChange={(e) =>
                  setShipping({ ...shipping, state: e.target.value })
                }
                required
                placeholder="e.g. Punjab, Sindh"
                className="w-full bg-[#180F05] border border-[#3D2C15] px-4 py-3 text-xs sm:text-sm text-[#F3EBDC] focus:outline-none focus:border-[#D4A359]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#D7D3CF]/70 mb-1.5">
                POSTAL CODE *
              </label>
              <input
                type="text"
                value={shipping.postal_code}
                onChange={(e) =>
                  setShipping({ ...shipping, postal_code: e.target.value })
                }
                required
                placeholder="e.g. 54000"
                className="w-full bg-[#180F05] border border-[#3D2C15] px-4 py-3 text-xs sm:text-sm text-[#F3EBDC] focus:outline-none focus:border-[#D4A359]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#D7D3CF]/70 mb-1.5">
                COUNTRY
              </label>
              <input
                type="text"
                value={shipping.country}
                disabled
                className="w-full bg-[#150D04] border border-[#3D2C15]/60 px-4 py-3 text-xs sm:text-sm text-[#D7D3CF]/60 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* ── 2. BILLING ADDRESS TOGGLE ──────────────────────────────────── */}
        <div className="pt-4 border-t border-[#3D2C15] space-y-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sameAsShipping}
              onChange={(e) => setSameAsShipping(e.target.checked)}
              className="w-4 h-4 accent-[#A8752B] bg-[#180F05] border-[#3D2C15]"
            />
            <span className="text-xs sm:text-sm text-[#F3EBDC] tracking-wide">
              Use shipping address as billing address
            </span>
          </label>

          {/* If separate billing address */}
          {!sameAsShipping && (
            <div className="pt-4 space-y-4 animate-in fade-in duration-200">
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#D4A359]">
                2. BILLING ADDRESS
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#D7D3CF]/70 mb-1.5">
                    BILLING FULL NAME *
                  </label>
                  <input
                    type="text"
                    value={billing.full_name}
                    onChange={(e) =>
                      setBilling({ ...billing, full_name: e.target.value })
                    }
                    required={!sameAsShipping}
                    className="w-full bg-[#180F05] border border-[#3D2C15] px-4 py-3 text-xs sm:text-sm text-[#F3EBDC] focus:outline-none focus:border-[#D4A359]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#D7D3CF]/70 mb-1.5">
                    PHONE NUMBER *
                  </label>
                  <input
                    type="tel"
                    value={billing.phone}
                    onChange={(e) =>
                      setBilling({ ...billing, phone: e.target.value })
                    }
                    required={!sameAsShipping}
                    placeholder="+92 300 0000000"
                    className="w-full bg-[#180F05] border border-[#3D2C15] px-4 py-3 text-xs sm:text-sm text-[#F3EBDC] focus:outline-none focus:border-[#D4A359]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#D7D3CF]/70 mb-1.5">
                    STREET ADDRESS *
                  </label>
                  <input
                    type="text"
                    value={billing.line1}
                    onChange={(e) =>
                      setBilling({ ...billing, line1: e.target.value })
                    }
                    required={!sameAsShipping}
                    className="w-full bg-[#180F05] border border-[#3D2C15] px-4 py-3 text-xs sm:text-sm text-[#F3EBDC] focus:outline-none focus:border-[#D4A359]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#D7D3CF]/70 mb-1.5">
                    CITY *
                  </label>
                  <input
                    type="text"
                    value={billing.city}
                    onChange={(e) =>
                      setBilling({ ...billing, city: e.target.value })
                    }
                    required={!sameAsShipping}
                    className="w-full bg-[#180F05] border border-[#3D2C15] px-4 py-3 text-xs sm:text-sm text-[#F3EBDC] focus:outline-none focus:border-[#D4A359]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#D7D3CF]/70 mb-1.5">
                    PROVINCE / STATE *
                  </label>
                  <input
                    type="text"
                    value={billing.state}
                    onChange={(e) =>
                      setBilling({ ...billing, state: e.target.value })
                    }
                    required={!sameAsShipping}
                    className="w-full bg-[#180F05] border border-[#3D2C15] px-4 py-3 text-xs sm:text-sm text-[#F3EBDC] focus:outline-none focus:border-[#D4A359]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#D7D3CF]/70 mb-1.5">
                    POSTAL CODE *
                  </label>
                  <input
                    type="text"
                    value={billing.postal_code}
                    onChange={(e) =>
                      setBilling({ ...billing, postal_code: e.target.value })
                    }
                    required={!sameAsShipping}
                    className="w-full bg-[#180F05] border border-[#3D2C15] px-4 py-3 text-xs sm:text-sm text-[#F3EBDC] focus:outline-none focus:border-[#D4A359]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={updating}
          className="px-8 py-3.5 bg-[#A8752B] hover:bg-[#C08A38] text-white text-xs font-semibold tracking-[0.2em] uppercase transition-colors disabled:opacity-50"
        >
          {updating ? "Saving Addresses..." : "Save Addresses"}
        </button>
      </form>
    </div>
  );
}