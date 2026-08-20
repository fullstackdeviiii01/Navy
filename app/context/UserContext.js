// // app/context/UserContext.js
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth } from "../../lib/firebase/firebaseClient";
import Loader from "../components/shared/Loader";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const syncInProgress = useRef(false);
  const [sessionId, setSessionId] = useState(null);

  // Fetch user profile from MongoDB
  const fetchUserProfile = useCallback(async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setDbUser(userData);
        return userData;
      } else {
        setDbUser(null);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Failed to load user profile");
      setDbUser(null);
      return null;
    }
  }, []);

  // Fetch user cart
  const fetchCart = useCallback(async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
        return data.cart;
      } else {
        setCart(null);
        return null;
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart(null);
      return null;
    }
  }, []);

  const fetchGuestCart = useCallback(async () => {
    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
        return data.cart;
      }
    } catch (error) {
      console.error("Error fetching guest cart:", error);
    }
  }, []);

  // Sync user with backend
  const syncUser = useCallback(
    async (user, additionalData = {}) => {
      if (syncInProgress.current) {
        return null;
      }

      syncInProgress.current = true;

      try {
        const token = await user.getIdToken();

        document.cookie = `__session=${token}; path=/; max-age=3600; secure; samesite=strict`;

        const response = await fetch("/api/users/sync", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(additionalData),
        });

        if (!response.ok) {
          const errorData = await response.json();

          if (errorData.error && errorData.error.includes("duplicate key")) {
            return await fetchUserProfile(user);
          }

          throw new Error("Failed to sync user");
        }

        const result = await response.json();

        // Fetch full profile and cart after sync
        const userProfile = await fetchUserProfile(user);
        await fetchCart(user);

        return { ...result, profile: userProfile };
      } catch (error) {
        console.error("User sync failed:", error);

        if (
          error.message.includes("duplicate key") ||
          error.code === 11000
        ) {
          return await fetchUserProfile(user);
        }

        return { success: false, error: error.message };
      } finally {
        syncInProgress.current = false;
      }
    },
    [fetchUserProfile, fetchCart]
  );

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;

      setFirebaseUser(firebaseUser);
      setError(null);

      if (firebaseUser) {
        // ✅ FIX: Check skipAutoSync flag.
        //
        // This flag is set by the sign-up page BEFORE Firebase creates the
        // user, so this listener doesn't race ahead and try to fetch a
        // profile that doesn't exist in MongoDB yet.
        //
        // The sign-up page removes this flag only AFTER MongoDB sync is
        // confirmed complete, then navigates with window.location.href.
        // That full-page reload triggers this listener again — this time
        // with no flag — so we fall through to the normal sync below,
        // and the profile fetch succeeds because the user now exists in DB.
        if (sessionStorage.getItem("skipAutoSync") === "true") {
          // Profile doesn't exist in DB yet — skip everything and wait
          // for the sign-up page to finish, remove the flag, and navigate.
          setLoading(false);
          return;
        }

        if (syncInProgress.current) {
          setLoading(false);
          return;
        }

        syncInProgress.current = true;

        try {
          const token = await firebaseUser.getIdToken();
          document.cookie = `__session=${token}; path=/; max-age=3600; secure; samesite=strict`;

          const explicitLogin =
            sessionStorage.getItem("isExplicitLogin") === "true";
          sessionStorage.removeItem("isExplicitLogin");

          const response = await fetch("/api/users/sync", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ isExplicitLogin: explicitLogin }),
          });

          if (response.ok || response.status === 409) {
            await fetchUserProfile(firebaseUser);
            await fetchCart(firebaseUser);
          }
        } catch (error) {
          console.error("Sync failed:", error);
        } finally {
          syncInProgress.current = false;
          setLoading(false);
        }
      } else {
        setDbUser(null);
        document.cookie =
          "__session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        await fetchGuestCart();
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [fetchUserProfile, fetchCart]);

  // Initialize or get session ID for guests
  useEffect(() => {
    if (!firebaseUser) {
      let storedSessionId = localStorage.getItem("guest_session_id");
      if (!storedSessionId) {
        storedSessionId = crypto.randomUUID();
        localStorage.setItem("guest_session_id", storedSessionId);
      }
      setSessionId(storedSessionId);
    } else {
      localStorage.removeItem("guest_session_id");
      setSessionId(null);
    }
  }, [firebaseUser]);

  // Role checks
  const hasRole = (role) => dbUser?.role === role;
  const isAdmin = () => dbUser?.role === "admin";
  const isUser = () => dbUser?.role === "user";
  const canAccess = (requiredRoles = []) => {
    if (!dbUser || !dbUser.role) return false;
    return requiredRoles.includes(dbUser.role);
  };

  // User status checks
  const isActive = () => dbUser?.is_active === true;
  const isBanned = () => dbUser?.is_banned === true;
  const isEmailVerified = () => dbUser?.email_verified === true;

  // Refresh user data
  const refreshUser = async () => {
    if (firebaseUser) {
      await fetchUserProfile(firebaseUser);
    }
  };

  // Refresh cart
  const refreshCart = async () => {
    if (firebaseUser) {
      await fetchCart(firebaseUser);
    } else {
      await fetchGuestCart();
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (!firebaseUser) return { success: false, error: "Not authenticated" };

    try {
      if (updates.name && updates.name !== firebaseUser.displayName) {
        await updateProfile(firebaseUser, {
          displayName: updates.name,
        });
      }

      const token = await firebaseUser.getIdToken();
      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setDbUser(updatedUser);
        return { success: true, data: updatedUser };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || "Update failed" };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const contextValue = {
    // User data
    firebaseUser,
    dbUser,
    user: dbUser,
    loading,
    error,
    sessionId,

    // Cart data
    cart,
    cartItemCount: cart?.items?.length || 0,

    // Authentication state
    isAuthenticated: !!firebaseUser && !!dbUser,
    isLoading: loading,

    // Role-based access
    hasRole,
    isAdmin,
    isUser,
    canAccess,

    // Status checks
    isActive,
    isBanned,
    isEmailVerified,

    // Actions
    refreshUser,
    refreshCart,
    updateUserProfile,

    // User properties
    uid: dbUser?.uid,
    email: dbUser?.email,
    name: dbUser?.name,
    role: dbUser?.role,
    avatar: dbUser?.avatar_url,
    phone: dbUser?.phone,
    wishlist: dbUser?.wishlist || [],
    addresses: dbUser?.addresses || [],
    orderCount: dbUser?.order_count || 0,
    totalSpent: dbUser?.total_spent || 0,
    customerSince: dbUser?.customer_since,
    preferences: {
      currency: dbUser?.preferred_currency || "PKR",
      locale: dbUser?.preferred_locale || "en-US",
      timezone: dbUser?.timezone || "UTC",
      marketing: dbUser?.marketing_opt_in || false,
      emailNotifications: dbUser?.email_notifications !== false,
      smsNotifications: dbUser?.sms_notifications || false,
    },
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

// Higher-order component for role-based access
export function withRoleAccess(
  WrappedComponent,
  requiredRoles = [],
  options = {}
) {
  const { fallback = null, redirect = null, showLoading = true } = options;

  return function RoleProtectedComponent(props) {
    const { canAccess, isAuthenticated, loading, isActive, isBanned } =
      useUser();

    if (loading && showLoading) {
      return (
        <div className="relative h-64">
          <Loader />
        </div>
      );
    }

    if (!isAuthenticated) {
      if (redirect) {
        if (typeof window !== "undefined") {
          window.location.href = redirect;
        }
        return null;
      }
      return fallback || <div>Access denied: Authentication required</div>;
    }

    if (isBanned()) {
      return <div>Account suspended. Please contact support.</div>;
    }

    if (!isActive()) {
      return <div>Account inactive. Please contact support.</div>;
    }

    if (requiredRoles.length > 0 && !canAccess(requiredRoles)) {
      return fallback || <div>Access denied: Insufficient permissions</div>;
    }

    return <WrappedComponent {...props} />;
  };
}

// Hook for conditional rendering based on roles
export function useRoleAccess(requiredRoles = []) {
  const { canAccess, isAuthenticated, isActive, isBanned } = useUser();

  return {
    hasAccess:
      isAuthenticated &&
      isActive() &&
      !isBanned() &&
      (requiredRoles.length === 0 || canAccess(requiredRoles)),
    isAuthenticated,
    isActive: isActive(),
    isBanned: isBanned(),
  };
}