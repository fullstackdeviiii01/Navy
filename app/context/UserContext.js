// app/context/UserContext.js
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import Loader from "../components/shared/Loader";

const UserContext = createContext(null);

export const getToken = () => {
  if (typeof window === "undefined") return "";
  const localToken =
    localStorage.getItem("auth_token") || localStorage.getItem("__session");
  if (localToken && localToken !== "undefined" && localToken !== "null") return localToken;
  const match =
    document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/) ||
    document.cookie.match(/(?:^|;\s*)__session=([^;]+)/);
  if (match) {
    const val = decodeURIComponent(match[1]);
    if (val && val !== "undefined" && val !== "null") return val;
  }
  return "";
};

export function UserProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [cart, setCart] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const syncInProgress = useRef(false);
  const [sessionId, setSessionId] = useState(null);

  // Fetch user profile from MongoDB using JWT
  const fetchUserProfile = useCallback(async (tokenParam) => {
    try {
      const token = tokenParam || getToken();
      if (!token) {
        setDbUser(null);
        return null;
      }
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

  // Fetch user cart (unified for both authenticated and guest users)
  const fetchCart = useCallback(async (tokenParam) => {
    try {
      const token = tokenParam !== undefined ? tokenParam : getToken();
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const storedSession =
        typeof window !== "undefined"
          ? localStorage.getItem("guest_session_id")
          : null;
      if (storedSession) {
        headers["x-session-id"] = storedSession;
      }
      const response = await fetch("/api/cart", {
        headers,
        credentials: "include",
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
    return await fetchCart("");
  }, [fetchCart]);

  // Check auth status on mount by calling /api/auth/me
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const token = getToken();

        if (!token) {
          setAuthUser(null);
          setDbUser(null);
          await fetchCart("");
          if (mounted) setLoading(false);
          return;
        }

        // Verify token with server
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!mounted) return;

        if (response.ok) {
          const userData = await response.json();
          setAuthUser(userData);
          localStorage.setItem("auth_token", token);

          // Fetch full profile and cart
          await Promise.all([
            fetchUserProfile(token),
            fetchCart(token),
          ]);
        } else if (response.status === 401 || response.status === 403) {
          // Token is explicitly rejected or expired by server — clear it
          localStorage.removeItem("auth_token");
          setAuthUser(null);
          setDbUser(null);
          await fetchCart("");
        }
      } catch (error) {
        // Network error (offline, device wake, connection blip) — do NOT wipe token
        console.error("Auth check network glitch:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [fetchUserProfile, fetchCart]);

  // Initialize or get session ID for guests
  useEffect(() => {
    if (!authUser) {
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
  }, [authUser]);

  // Login function — called after successful signin API call
  const login = useCallback(
    async (token, userData) => {
      localStorage.setItem("auth_token", token);
      const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
      document.cookie = `__session=${token}; path=/; max-age=604800; ${isHttps ? "secure;" : ""} samesite=lax`;
      setAuthUser(userData);

      // Fetch full profile and cart
      const profile = await fetchUserProfile(token);
      await fetchCart(token);

      return profile;
    },
    [fetchUserProfile, fetchCart]
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout API error:", error);
    }

    localStorage.removeItem("auth_token");
    document.cookie = "__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setAuthUser(null);
    setDbUser(null);
    setCart(null);
  }, []);

  // Role checks (check both dbUser and authUser to avoid race condition on reload)
  const hasRole = (role) => (dbUser?.role || authUser?.role) === role;
  const isAdmin = () => (dbUser?.role || authUser?.role) === "admin";
  const isUser = () => (dbUser?.role || authUser?.role) === "user";
  const canAccess = (requiredRoles = []) => {
    const role = dbUser?.role || authUser?.role;
    if (!role) return false;
    return requiredRoles.includes(role);
  };

  // User status checks
  const isActive = () => (dbUser?.is_active !== undefined ? dbUser.is_active === true : true);
  const isBanned = () => dbUser?.is_banned === true;
  const isEmailVerified = () => (dbUser?.email_verified ?? authUser?.email_verified ?? false);

  // Refresh user data
  const refreshUser = async () => {
    const token = getToken();
    if (token) {
      await fetchUserProfile(token);
    }
  };

  // Refresh cart
  const refreshCart = async () => {
    return await fetchCart();
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    const token = getToken();
    if (!token) return { success: false, error: "Not authenticated" };

    try {
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
    authUser,
    dbUser,
    user: dbUser,
    loading,
    error,
    sessionId,

    // Cart data
    cart,
    setCart: (newCart) => setCart(newCart),
    updateCart: (newCart) => setCart(newCart),
    cartItemCount: cart?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0,

    // Cart sidebar
    isCartOpen,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),

    // Authentication state
    isAuthenticated: !!authUser || !!dbUser,
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
    login,
    logout,
    refreshUser,
    refreshCart,
    updateUserProfile,

    // User properties
    uid: dbUser?.uid || dbUser?._id || authUser?.uid || authUser?.id,
    email: dbUser?.email || authUser?.email,
    name: dbUser?.name || authUser?.name,
    role: dbUser?.role || authUser?.role,
    avatar: dbUser?.avatar_url || authUser?.avatar_url || authUser?.picture,
    phone: dbUser?.phone,
    wishlist: dbUser?.wishlist || [],
    addresses: dbUser?.addresses || [],
    orderCount: dbUser?.order_count || 0,
    totalSpent: dbUser?.total_spent || 0,
    customerSince: dbUser?.customer_since,
    preferences: {
      currency: "PKR",
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
