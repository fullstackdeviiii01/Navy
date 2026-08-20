// app/components/account/AddressesTab.tsx
"use client";

import { useState } from "react";
import { MapPin, Plus, Edit2, Trash2, Phone } from "lucide-react";
import AddressModal from "./AddressModal";

interface AddressesTabProps {
  dbUser: any;
  firebaseUser: any;
  refreshUser: () => Promise<void>;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  updating: boolean;
  setUpdating: (updating: boolean) => void;
}

export default function AddressesTab({
  dbUser,
  firebaseUser,
  refreshUser,
  setError,
  setSuccess,
  updating,
  setUpdating,
}: AddressesTabProps) {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressModal(true);
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    setUpdating(true);
    setError("");

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/users/addresses/${addressId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await refreshUser();
        setSuccess("Address deleted successfully");
      } else {
        throw new Error("Failed to delete address");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Saved Addresses
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your shipping and billing addresses
            </p>
          </div>
          <button
            onClick={handleAddAddress}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {dbUser?.addresses && dbUser.addresses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {dbUser.addresses.map((address: any, index: number) => (
                <div
                  key={address._id || index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          address.type === "shipping"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                        }`}
                      >
                        {address.type === "shipping" ? "Shipping" : "Billing"}
                      </span>
                      {address.label && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {address.label}
                        </span>
                      )}
                      {address.is_default_shipping && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="p-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Edit"
                        aria-label="Edit address"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address._id)}
                        className="p-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete"
                        aria-label="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                      {address.full_name}
                    </p>
                    
                    {address.phone && (
                      <p className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-3.5 h-3.5" />
                        {address.phone}
                      </p>
                    )}
                    
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p>{address.line1}</p>
                        {address.line2 && <p>{address.line2}</p>}
                        <p>{address.city}, {address.state} {address.postal_code}</p>
                        <p>{address.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <MapPin className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Addresses Saved
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Add your addresses for faster checkout
              </p>
            </div>
          )}
        </div>
      </div>

      {showAddressModal && (
        <AddressModal
          address={editingAddress}
          dbUser={dbUser}
          firebaseUser={firebaseUser}
          onClose={() => setShowAddressModal(false)}
          refreshUser={refreshUser}
          setError={setError}
          setSuccess={setSuccess}
          updating={updating}
          setUpdating={setUpdating}
        />
      )}
    </>
  );
}