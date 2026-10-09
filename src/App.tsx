/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  ArrowRight,
  SlidersHorizontal,
  Check,
  Eye,
  X,
  Heart,
  Share2,
  LogOut,
  MapPin,
  Truck,
} from 'lucide-react';
import {
  PRODUCE_CATALOG,
  FIELD_PARCEL_LEDGER,
  CHEF_TESTIMONIALS,
  GENERATED_IMAGES,
  ProduceProduct,
  ProduceVariant,
} from './data/produceData';
import { ResilientImage } from './components/ResilientImage';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CustomBoxBuilder, ConfiguredCustomBox } from './components/CustomBoxBuilder';
import { CartCheckoutDrawer, CartItem } from './components/CartCheckoutDrawer';
import { AuthPortal, AuthenticatedUser } from './components/AuthPortalModal';
import { OrderTrackingSection, OrderRecord } from './components/OrderTrackingSection';
import { ResellAndShareModal } from './components/ResellAndShareModal';
import { JavaBackendExplorer } from './components/JavaBackendExplorer';

type CategoryFilter =
  | 'All'
  | 'Heirloom Vegetables'
  | 'Orchard Fruits'
  | 'Leafy Greens & Roots'
  | 'Curated Crates'
  | 'Under $15'
  | 'Wishlist';

type SortOption = 'featured' | 'brix-desc' | 'price-asc' | 'price-desc';

export default function App() {
  // Authentication State (starts at Login screen as requested: "starting with login and log out functions")
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);

  // Search, Filter, Wishlist & Pincode State
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [activeParcelHighlight, setActiveParcelHighlight] = useState<string | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>(['prod-heirloom-tomatoes']);

  // Pincode Serviceability Checker
  const [pincodeInput, setPincodeInput] = useState<string>('500033');
  const [pincodeStatus, setPincodeStatus] = useState<string>(
    'Delivering to 500033 · Tomorrow by 08:30 AM · COD & UPI Available'
  );

  // Modals & Drawers
  const [inspectedProduct, setInspectedProduct] = useState<ProduceProduct | null>(null);
  const [resellModalProduct, setResellModalProduct] = useState<ProduceProduct | null>(null);
  const [defaultCheckoutMargin, setDefaultCheckoutMargin] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Live Orders State (synced with /api/orders)
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  // Cart Items State
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      cartItemId: 'prod-heirloom-tomatoes::v-tom-std',
      productId: 'prod-heirloom-tomatoes',
      title: 'Brandywine & Cherokee Purple Vine Tomatoes',
      subtitle: 'Standard 2.0 lb Vine Cluster · Parcel 04-B',
      price: 12.5,
      quantity: 1,
      image: GENERATED_IMAGES.heirloomTomatoes,
    },
    {
      cartItemId: 'prod-orchard-citrus-figs::v-cit-std',
      productId: 'prod-orchard-citrus-figs',
      title: 'Meyer Lemons, Moro Blood Oranges & Black Mission Figs',
      subtitle: '3.0 lb Orchard Tasting Flight · Parcel 09-A',
      price: 18.0,
      quantity: 1,
      image: GENERATED_IMAGES.orchardCitrusFigs,
    },
  ]);

  const catalogSectionRef = useRef<HTMLElement | null>(null);
  const trackingSectionRef = useRef<HTMLDivElement | null>(null);

  // Fetch initial orders from full-stack backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch {
        // Ignore network errors on initial load
      }
    };
    fetchOrders();
  }, [currentUser]);

  // Logout Handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors
    }
    setCurrentUser(null);
    setIsCartOpen(false);
  };

  // Pincode Checker Handler
  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/pincode/${encodeURIComponent(pincodeInput.trim())}`);
      const data = await res.json();
      if (res.ok && data.serviceable) {
        setPincodeStatus(
          `Delivering to ${data.pincode} · ${data.estimatedDelivery} · COD & UPI Available`
        );
      } else {
        setPincodeStatus(data.message || 'Enter a valid 6-digit pincode.');
      }
    } catch {
      setPincodeStatus(
        `Delivering to ${pincodeInput} · Tomorrow by 08:30 AM · COD & UPI Available`
      );
    }
  };

  // Wishlist Toggle
  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return PRODUCE_CATALOG.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All'
          ? true
          : selectedCategory === 'Under $15'
          ? product.price < 15.0
          : selectedCategory === 'Wishlist'
          ? wishlistIds.includes(product.id)
          : product.category === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.botanicalName.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.parcelLocation.toLowerCase().includes(q) ||
        product.tastingNotes.toLowerCase().includes(q);

      const matchesParcel =
        !activeParcelHighlight ||
        product.parcelId.toUpperCase().includes(activeParcelHighlight.replace('PARCEL ', '')) ||
        product.parcelId === 'Parcels 01–09';

      return matchesCategory && matchesSearch && matchesParcel;
    }).sort((a, b) => {
      if (sortBy === 'brix-desc') return b.brixScore - a.brixScore;
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [selectedCategory, searchQuery, sortBy, activeParcelHighlight, wishlistIds]);

  // Cart Summary Calculations
  const { totalCartCount, totalCartValue } = useMemo(() => {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const value = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { totalCartCount: count, totalCartValue: value };
  }, [cartItems]);

  // Cart Handlers
  const handleQuickAddProduct = (product: ProduceProduct) => {
    const defaultVariant = product.variants[0];
    handleAddProductWithVariant(product, defaultVariant, 1);
    setRecentlyAddedId(product.id);
    setTimeout(() => {
      setRecentlyAddedId((prev) => (prev === product.id ? null : prev));
    }, 1300);
  };

  const handleAddProductWithVariant = (
    product: ProduceProduct,
    variant: ProduceVariant,
    quantity: number
  ) => {
    const cartItemId = `${product.id}::${variant.id}`;
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [
        ...prev,
        {
          cartItemId,
          productId: product.id,
          title: product.name,
          subtitle: `${variant.label} · ${product.parcelId}`,
          price: variant.price,
          quantity,
          image: product.image,
        },
      ];
    });
  };

  const handleStartResellCheckout = (product: ProduceProduct, marginAmount: number) => {
    const defaultVariant = product.variants[0];
    handleAddProductWithVariant(product, defaultVariant, 1);
    setDefaultCheckoutMargin(marginAmount);
    setResellModalProduct(null);
    setIsCartOpen(true);
  };

  const handleAddCustomBoxToCart = (box: ConfiguredCustomBox) => {
    const cadenceLabel =
      box.cadence === 'weekly'
        ? 'Weekly Thursday Drop'
        : box.cadence === 'biweekly'
        ? 'Bi-Weekly Drop'
        : 'Single Dawn Harvest';

    const customContents = box.items.map((i) => `${i.count}× ${i.name}`);
    const signatureKey = `custom-box::${box.tier.id}::${box.cadence}::${customContents.join('|')}`;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.cartItemId === signatureKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [
        ...prev,
        {
          cartItemId: signatureKey,
          productId: signatureKey,
          title: `Custom ${box.tier.name}`,
          subtitle: `${cadenceLabel} · ${box.totalWeightLbs.toFixed(1)} lbs Net`,
          price: box.finalPrice,
          quantity: 1,
          image: GENERATED_IMAGES.heroCrate,
          customContents,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Order Tracking Handlers
  const handleOrderCreated = (newOrder: OrderRecord) => {
    setOrders((prev) => [newOrder, ...prev]);
    if (newOrder.isResellOrder && newOrder.resellerMargin > 0 && currentUser) {
      setCurrentUser({
        ...currentUser,
        resellerEarnings: currentUser.resellerEarnings + newOrder.resellerMargin,
      });
    }
  };

  const handleAdvanceOrderStage = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/advance-status`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated: OrderRecord = await res.json();
        setOrders((prev) => prev.map((o) => (o.orderId === orderId ? updated : o)));
      }
    } catch {
      // Offline fallback advance
      setOrders((prev) =>
        prev.map((o) => {
          if (o.orderId !== orderId) return o;
          const nextIdx = Math.min(4, o.currentStageIndex + 1);
          return {
            ...o,
            currentStageIndex: nextIdx,
            status: nextIdx === 4 ? 'DELIVERED' : o.status,
            trackingSteps: o.trackingSteps.map((s, idx) => ({
              ...s,
              completed: idx <= nextIdx,
              timestamp: idx <= nextIdx ? s.timestamp || 'Just updated' : null,
            })),
          };
        })
      );
    }
  };

  const handleCancelOrReturnOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/cancel`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated: OrderRecord = await res.json();
        setOrders((prev) => prev.map((o) => (o.orderId === orderId ? updated : o)));
      }
    } catch {
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId
            ? {
                ...o,
                status: o.status === 'DELIVERED' ? 'RETURN_REQUESTED' : 'CANCELLED',
                paymentStatus: 'REFUNDED',
              }
            : o
        )
      );
    }
  };

  const handleFilterByParcel = (parcelCode: string) => {
    if (activeParcelHighlight === parcelCode) {
      setActiveParcelHighlight(null);
    } else {
      setActiveParcelHighlight(parcelCode);
      setSelectedCategory('All');
      catalogSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Start with Login / Sign Up Portal until authenticated
  if (!currentUser) {
    return <AuthPortal onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#181D18] selection:bg-[#1F472B] selection:text-[#FAF9F5]">
      {/* Strict 3-Zone Top Navigation Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-xs border-b border-[#E4E0D8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark in display face */}
          <a
            href="#"
            className="font-display text-2xl font-semibold tracking-tight text-[#181D18] whitespace-nowrap shrink-0"
          >
            Verdure &amp; Loam
          </a>

          {/* Zone 2: 5 clean text navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4E564C]"
          >
            <a
              href="#seasonal-harvest"
              className="hover:text-[#181D18] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Seasonal Catalog
            </a>
            <a
              href="#custom-box"
              className="hover:text-[#181D18] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Custom Crate
            </a>
            <a
              href="#track-orders"
              className="hover:text-[#181D18] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Track Orders ({orders.length})
            </a>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Wishlist');
                catalogSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#181D18] hover:underline underline-offset-4 transition-colors whitespace-nowrap cursor-pointer"
            >
              Wishlist ({wishlistIds.length})
            </button>
            <a
              href="#java-spring-code"
              className="hover:text-[#181D18] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Java Spring Code
            </a>
          </nav>

          {/* Zone 3: 2 Primary Actions (Harvest Bag Trigger + Logout Button) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-[#1F472B] hover:bg-[#16351F] text-[#FAF9F5] text-xs font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Bag ({totalCartCount})</span>
              <span className="font-mono tabular-nums hidden sm:inline">
                · ${totalCartValue.toFixed(2)}
              </span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title={`Signed in as ${currentUser.fullName} (${currentUser.role})`}
              className="px-3 py-2 rounded-lg border border-[#D5CFC4] hover:border-[#9E2A2B] hover:text-[#9E2A2B] text-xs font-medium text-[#181D18] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout ({currentUser.fullName.split(' ')[0]})</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* SECTION 1: Storefront Hero & User/Reseller Welcome Strip */}
        <section className="pt-8 pb-14 md:pt-12 md:pb-20 border-b border-[#E4E0D8]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {/* Authenticated Account & Pincode Serviceability Bar */}
            <div className="mb-8 p-4 rounded-xl bg-[#F2EFE9] border border-[#E4E0D8] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#3F463E]">
                <span className="font-semibold text-[#181D18]">
                  Welcome, {currentUser.fullName}
                </span>
                <span aria-hidden="true">·</span>
                <span>Account Role: {currentUser.role}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-[#1F472B] font-semibold">
                  Reseller Wallet Earnings: ${currentUser.resellerEarnings.toFixed(2)}
                </span>
              </div>

              <form onSubmit={handleCheckPincode} className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-[#5A6258]">
                  <MapPin className="w-3.5 h-3.5 text-[#1F472B]" />
                  <span>{pincodeStatus}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value)}
                    placeholder="Pincode"
                    maxLength={6}
                    className="w-24 px-2.5 py-1 text-xs font-mono tabular-nums rounded-md border border-[#D5CFC4] bg-[#FAF9F5]"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 rounded-md border border-[#181D18] text-xs font-medium text-[#181D18] hover:bg-[#FAF9F5] cursor-pointer whitespace-nowrap"
                  >
                    Check Pincode
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Editorial Narrative & Direct Actions */}
              <div className="lg:col-span-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#5A6258]">
                  <span>Farm-Direct Wholesale Pricing</span>
                  <span aria-hidden="true">·</span>
                  <span>CCOF Regenerative Organic</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-[#1F472B] font-medium">
                    Picked 05:00 AM PDT
                  </span>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-[52px] font-semibold text-[#181D18] mt-4 leading-[1.08] text-balance">
                  Organic Vegetables &amp; Orchard Fruits Direct From Living Soil.
                </h1>

                <p className="mt-5 text-base text-[#3F463E] leading-relaxed max-w-xl">
                  Order dawn-harvested produce at lowest farm-gate prices, build a custom weekly
                  cedar crate, or use Meesho-style Resell &amp; Earn to share organic lots with
                  your own custom margin—with UPI, Card, COD, and live 5-stage tracking.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="#seasonal-harvest"
                    className="px-6 py-3.5 rounded-lg bg-[#1F472B] hover:bg-[#16351F] text-[#FAF9F5] text-sm font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>Shop Seasonal Catalog</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <a
                    href="#track-orders"
                    className="px-5 py-3.5 rounded-lg border border-[#C5BFB3] hover:border-[#181D18] text-[#181D18] text-sm font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                  >
                    <Truck className="w-4 h-4 text-[#1F472B]" />
                    <span>Track Live Orders ({orders.length})</span>
                  </a>
                </div>
              </div>

              {/* Right Column: 16:9 Editorial Hero Showcase */}
              <div className="lg:col-span-6">
                <div className="rounded-xl overflow-hidden bg-[#F2EFE9] border border-[#E4E0D8]">
                  <div className="aspect-16/9 w-full overflow-hidden">
                    <ResilientImage
                      src={GENERATED_IMAGES.heroCrate}
                      alt="Artisanal cedar harvest crate filled with heirloom tomatoes, rainbow carrots, Lacinato kale, blood oranges, and black mission figs"
                      fallbackTitle="The Signature Dawn Harvest Provision Crate"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 sm:px-6 bg-[#F2EFE9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E4E0D8]">
                    <div>
                      <div className="text-xs text-[#5A6258]">
                        Featured Combo · Parcels 01–09 · 11.0 lb Cedar Crate
                      </div>
                      <div className="text-sm font-semibold text-[#181D18] mt-0.5">
                        The Signature Dawn Harvest Provision Crate
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setResellModalProduct(PRODUCE_CATALOG[4])}
                        className="text-xs font-medium text-[#181D18] hover:underline inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#1F472B]" />
                        <span>Resell &amp; Earn</span>
                      </button>
                      <span aria-hidden="true" className="text-[#C5BFB3]">·</span>
                      <button
                        type="button"
                        onClick={() => setInspectedProduct(PRODUCE_CATALOG[4])}
                        className="text-xs font-medium text-[#1F472B] hover:underline inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                      >
                        <span>Inspect Crate ($54.00)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Featured Seasonal Harvest Collection (with Meesho Resell, Wishlist, Search & Sort) */}
        <section
          id="seasonal-harvest"
          ref={catalogSectionRef}
          className="py-16 md:py-20"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E4E0D8]">
              <div>
                <div className="text-xs text-[#5A6258] font-medium">
                  01. Farm-Direct Organic Catalog · Lowest Price Guaranteed · Easy 7-Day Freshness Replacement
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#181D18] mt-2 text-balance">
                  Seasonal Organic Vegetables &amp; Orchard Fruits
                </h2>
              </div>

              {/* Search & Sort Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#5A6258] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tomatoes, figs, carrots..."
                    aria-label="Search seasonal produce"
                    className="pl-8 pr-7 py-2 text-xs rounded-lg border border-[#D5CFC4] bg-[#FAF9F5] text-[#181D18] w-56 sm:w-64 focus:outline-2 focus:outline-[#1F472B]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search query"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5A6258] hover:text-[#181D18] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D5CFC4] bg-[#FAF9F5] text-xs text-[#181D18]">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#5A6258]" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent text-xs font-medium text-[#181D18] focus:outline-none cursor-pointer"
                  >
                    <option value="featured">Sort: Featured Lots</option>
                    <option value="price-asc">Sort: Price Low to High</option>
                    <option value="price-desc">Sort: Price High to Low</option>
                    <option value="brix-desc">Sort: Highest Brix Sweetness</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category & Budget Filter Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#F2EFE9] rounded-lg">
                {(
                  [
                    'All',
                    'Under $15',
                    'Heirloom Vegetables',
                    'Orchard Fruits',
                    'Leafy Greens & Roots',
                    'Curated Crates',
                    'Wishlist',
                  ] as CategoryFilter[]
                ).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategory === category
                        ? 'bg-[#FAF9F5] text-[#181D18] shadow-2xs'
                        : 'text-[#5A6258] hover:text-[#181D18]'
                    }`}
                  >
                    {category === 'All'
                      ? 'All Produce'
                      : category === 'Wishlist'
                      ? `Saved Wishlist (${wishlistIds.length})`
                      : category}
                  </button>
                ))}
              </div>

              {activeParcelHighlight && (
                <div className="flex items-center gap-2 text-xs text-[#1F472B]">
                  <span>Filtered by {activeParcelHighlight}</span>
                  <button
                    type="button"
                    onClick={() => setActiveParcelHighlight(null)}
                    className="underline hover:text-[#181D18] cursor-pointer"
                  >
                    Clear parcel filter
                  </button>
                </div>
              )}
            </div>

            {/* 3-Column Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="mt-12 p-12 text-center rounded-xl border border-[#E4E0D8] bg-[#F2EFE9]">
                <p className="font-display text-2xl text-[#181D18]">
                  No organic lots match your current filter
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setActiveParcelHighlight(null);
                  }}
                  className="mt-5 px-4 py-2 rounded-lg bg-[#1F472B] text-[#FAF9F5] text-xs font-medium hover:bg-[#16351F] transition-colors cursor-pointer"
                >
                  Show All Organic Produce
                </button>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => {
                  const isJustAdded = recentlyAddedId === product.id;
                  const isWishlisted = wishlistIds.includes(product.id);

                  return (
                    <article
                      key={product.id}
                      className="group rounded-xl bg-[#FAF9F5] border border-[#E4E0D8] overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <div>
                        {/* Product Image Container */}
                        <div className="aspect-4/3 w-full bg-[#F2EFE9] overflow-hidden relative">
                          <div
                            onClick={() => setInspectedProduct(product)}
                            className="w-full h-full cursor-pointer"
                          >
                            <ResilientImage
                              src={product.image}
                              alt={product.name}
                              objectPosition={product.imageObjectPosition}
                              fallbackTitle={product.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            />
                          </div>

                          {/* Functional Wishlist Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleWishlist(product.id)}
                            aria-label={
                              isWishlisted
                                ? `Remove ${product.name} from wishlist`
                                : `Save ${product.name} to wishlist`
                            }
                            className="absolute top-3 right-3 p-2 rounded-full bg-[#FAF9F5]/90 hover:bg-[#FAF9F5] text-[#181D18] transition-colors cursor-pointer"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isWishlisted ? 'fill-[#9E2A2B] text-[#9E2A2B]' : 'text-[#5A6258]'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Card Body: Clean Unboxed Metadata */}
                        <div className="p-6">
                          <div className="flex items-center gap-1.5 text-xs text-[#5A6258] truncate">
                            <span className="uppercase tracking-wider text-[11px]">
                              {product.shortCategory}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{product.parcelId}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums text-[#1F472B]">
                              {product.brixScore.toFixed(1)}° Brix
                            </span>
                          </div>

                          <div className="mt-2 flex items-baseline justify-between gap-4">
                            <h3 className="text-base font-semibold text-[#181D18] leading-snug">
                              <button
                                type="button"
                                onClick={() => setInspectedProduct(product)}
                                className="text-left hover:underline decoration-[#1F472B] underline-offset-4 cursor-pointer"
                              >
                                {product.name}
                              </button>
                            </h3>
                            <span className="font-mono text-[15px] font-medium text-[#181D18] tabular-nums shrink-0">
                              ${product.price.toFixed(2)}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center gap-2 text-xs text-[#5A6258]">
                            <span>{product.unit}</span>
                            <span aria-hidden="true">·</span>
                            <span>Free Delivery over $45</span>
                          </div>

                          <p className="mt-3 text-xs text-[#3F463E] line-clamp-2 leading-relaxed">
                            {product.tastingNotes}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer Actions: Inspect, Resell & Earn, Add to Bag */}
                      <div className="px-6 pb-6 pt-3 border-t border-[#F2EFE9] flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setInspectedProduct(product)}
                          className="px-3 py-2 rounded-lg border border-[#D5CFC4] hover:border-[#181D18] text-xs font-medium text-[#181D18] transition-colors inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#5A6258]" />
                          <span>Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setResellModalProduct(product)}
                          className="px-3 py-2 rounded-lg border border-[#D5CFC4] hover:border-[#1F472B] text-xs font-medium text-[#1F472B] transition-colors inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Resell</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickAddProduct(product)}
                          className="flex-1 py-2 px-3 rounded-lg bg-[#1F472B] hover:bg-[#16351F] text-[#FAF9F5] text-xs font-medium transition-colors inline-flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                        >
                          {isJustAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <span>Add · ${product.price.toFixed(2)}</span>
                          )}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: Live Order Tracking & Reseller Shipments Section */}
        <div ref={trackingSectionRef} className="border-t border-[#E4E0D8]">
          <OrderTrackingSection
            orders={orders}
            onAdvanceOrderStage={handleAdvanceOrderStage}
            onCancelOrReturnOrder={handleCancelOrReturnOrder}
            onBackToCatalog={() =>
              catalogSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
          />
        </div>

        {/* SECTION 4: Interactive Custom Harvest Crate Configurator */}
        <CustomBoxBuilder onAddCustomBoxToCart={handleAddCustomBoxToCart} />

        {/* SECTION 5: Java Spring Boot Full-Stack Backend Codebase Explorer */}
        <JavaBackendExplorer />

        {/* SECTION 6: Regenerative Soil Ledger & Attributable Proof */}
        <section
          id="field-ledger"
          className="py-16 md:py-20 border-t border-[#E4E0D8] bg-[#FAF9F5]"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="text-xs text-[#5A6258] font-medium">
                Agronomic Transparency &amp; Soil Health Ledger
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#181D18] mt-2 text-balance">
                Every Harvest Lot Traced to Its Living Soil Parcel
              </h2>
            </div>

            <div className="mt-8 overflow-x-auto border border-[#E4E0D8] rounded-xl bg-[#FAF9F5]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E4E0D8] bg-[#F2EFE9] text-xs font-semibold text-[#5A6258]">
                    <th className="py-3.5 px-4">Parcel ID</th>
                    <th className="py-3.5 px-4">Field &amp; Micro-Climate</th>
                    <th className="py-3.5 px-4">Active Crop Family</th>
                    <th className="py-3.5 px-4">Cover Crop Rotation</th>
                    <th className="py-3.5 px-4 text-right">Soil Organic Matter</th>
                    <th className="py-3.5 px-4 text-right">Harvest Window</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E0D8] text-xs">
                  {FIELD_PARCEL_LEDGER.map((parcel) => {
                    const isSelected = activeParcelHighlight === parcel.parcelCode;
                    return (
                      <tr
                        key={parcel.parcelCode}
                        onClick={() => handleFilterByParcel(parcel.parcelCode)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#F2EFE9] font-medium' : 'hover:bg-[#F2EFE9]/60'
                        }`}
                      >
                        <td className="py-4 px-4 font-mono tabular-nums font-medium text-[#1F472B] whitespace-nowrap">
                          {parcel.parcelCode}
                        </td>
                        <td className="py-4 px-4 text-[#181D18] whitespace-nowrap">
                          {parcel.fieldName} · <span className="text-[#5A6258]">{parcel.region}</span>
                        </td>
                        <td className="py-4 px-4 text-[#181D18]">{parcel.cropFamily}</td>
                        <td className="py-4 px-4 text-[#5A6258]">{parcel.coverCropRotation}</td>
                        <td className="py-4 px-4 text-right font-mono tabular-nums font-medium text-[#181D18]">
                          {parcel.soilOrganicMatter}
                        </td>
                        <td className="py-4 px-4 text-right font-mono tabular-nums text-[#181D18] whitespace-nowrap">
                          {parcel.harvestWindow}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Testimonials */}
            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8">
              {CHEF_TESTIMONIALS.map((item) => (
                <blockquote
                  key={item.id}
                  className="p-6 rounded-xl bg-[#F2EFE9] border border-[#E4E0D8] flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-mono tabular-nums text-[#1F472B] font-medium pb-3 border-b border-[#DFDBD2]">
                      Outcome: {item.beforeOutcome}
                    </div>
                    <p className="mt-3 font-display text-lg text-[#181D18] leading-relaxed italic">
                      “{item.quote}”
                    </p>
                  </div>
                  <footer className="mt-4 pt-3 border-t border-[#DFDBD2] flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#181D18]">
                      {item.author} · <span className="font-normal text-[#3F463E]">{item.role}</span>
                    </span>
                    <span className="text-[#5A6258]">{item.organization}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#E4E0D8] bg-[#F2EFE9] py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="font-display text-xl font-semibold text-[#181D18]">
              Verdure &amp; Loam
            </div>
            <p className="text-xs text-[#5A6258] mt-1">
              Full-Stack Organic Produce Marketplace · Java Spring Boot Backend + React Storefront
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#5A6258]">
            <a href="#seasonal-harvest" className="hover:text-[#181D18]">
              Catalog
            </a>
            <a href="#track-orders" className="hover:text-[#181D18]">
              Track Orders
            </a>
            <a href="#custom-box" className="hover:text-[#181D18]">
              Custom Crate
            </a>
            <a href="#java-spring-code" className="hover:text-[#181D18]">
              Java Spring Boot Code
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="hover:text-[#9E2A2B] cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </footer>

      {/* Contiguous Purchase Module (PDP Modal) */}
      <ProductDetailModal
        product={inspectedProduct}
        onClose={() => setInspectedProduct(null)}
        onAddToCart={handleAddProductWithVariant}
      />

      {/* Meesho-Style Resell & Share Modal */}
      <ResellAndShareModal
        product={resellModalProduct}
        onClose={() => setResellModalProduct(null)}
        onStartResellCheckout={handleStartResellCheckout}
      />

      {/* Slide-Over Cart, Multi-Payment & Reseller Checkout Drawer */}
      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => {
          setIsCartOpen(false);
          setDefaultCheckoutMargin(0);
        }}
        items={cartItems}
        defaultResellMargin={defaultCheckoutMargin}
        userId={currentUser.id}
        defaultCustomerName={currentUser.fullName}
        defaultCustomerPhone={currentUser.phone}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onOrderCreated={handleOrderCreated}
        onNavigateToTracking={() => {
          trackingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
}
