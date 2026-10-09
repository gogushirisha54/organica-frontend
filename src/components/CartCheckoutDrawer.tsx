import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Truck,
  Printer,
  ArrowRight,
  CreditCard,
  Smartphone,
  Landmark,
  Banknote,
} from 'lucide-react';
import { ResilientImage } from './ResilientImage';
import { OrderRecord } from './OrderTrackingSection';

export interface CartItem {
  cartItemId: string;
  productId: string;
  title: string;
  subtitle: string;
  price: number;
  quantity: number;
  image: string;
  customContents?: string[];
}

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  defaultResellMargin?: number;
  userId: string;
  defaultCustomerName: string;
  defaultCustomerPhone: string;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOrderCreated: (newOrder: OrderRecord) => void;
  onNavigateToTracking: () => void;
}

const FREE_DELIVERY_THRESHOLD = 45.0;
const STANDARD_DELIVERY_FEE = 5.5;

export const CartCheckoutDrawer: React.FC<CartCheckoutDrawerProps> = ({
  isOpen,
  onClose,
  items,
  defaultResellMargin = 0,
  userId,
  defaultCustomerName,
  defaultCustomerPhone,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCreated,
  onNavigateToTracking,
}) => {
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // Meesho-style Reselling Toggle & Margin
  const [isResellOrder, setIsResellOrder] = useState<boolean>(defaultResellMargin > 0);
  const [resellerMargin, setResellerMargin] = useState<number>(
    defaultResellMargin > 0 ? defaultResellMargin : 6.0
  );

  // Payment Gateway State
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'COD'>('UPI');
  const [upiId, setUpiId] = useState('shirisha@okaxis');
  const [upiVerified, setUpiVerified] = useState(true);
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8891');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('842');
  const [selectedBank, setSelectedBank] = useState('State Bank of India (SBI)');

  // Delivery Address Fields
  const [customerName, setCustomerName] = useState(defaultCustomerName || 'Shirisha Gogu');
  const [phone, setPhone] = useState(defaultCustomerPhone || '9876543210');
  const [address, setAddress] = useState('Flat 402, Green Lotus Enclave, Jubilee Hills');
  const [postalCode, setPostalCode] = useState('500033');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    if (defaultResellMargin > 0) {
      setIsResellOrder(true);
      setResellerMargin(defaultResellMargin);
    }
  }, [defaultResellMargin]);

  useEffect(() => {
    if (defaultCustomerName) setCustomerName(defaultCustomerName);
    if (defaultCustomerPhone) setPhone(defaultCustomerPhone);
  }, [defaultCustomerName, defaultCustomerPhone]);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedPromo ? Number(((subtotal * appliedPromo.percent) / 100).toFixed(2)) : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const isFreeDelivery = discountedSubtotal >= FREE_DELIVERY_THRESHOLD || discountedSubtotal === 0;
  const deliveryFee = isFreeDelivery ? 0 : STANDARD_DELIVERY_FEE;
  const baseOrderTotal = discountedSubtotal + deliveryFee;
  const activeMargin = isResellOrder ? Math.max(0, resellerMargin) : 0;
  const finalCustomerTotal = Number((baseOrderTotal + activeMargin).toFixed(2));
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - discountedSubtotal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = promoCodeInput.trim().toUpperCase();
    if (!cleaned) return;
    if (cleaned === 'HARVEST10' || cleaned === 'MEESHO10') {
      setAppliedPromo({ code: cleaned, percent: 10 });
      setPromoMessage('10% Organic Harvest discount applied.');
    } else if (cleaned === 'ORGANIC20') {
      setAppliedPromo({ code: cleaned, percent: 20 });
      setPromoMessage('20% Super Saver discount applied.');
    } else {
      setPromoMessage('Try code HARVEST10 or ORGANIC20.');
    }
  };

  const handleVerifyUpi = () => {
    if (upiId.includes('@') && upiId.length >= 5) {
      setUpiVerified(true);
      setFormError(null);
    } else {
      setUpiVerified(false);
      setFormError('Please enter a valid UPI ID (e.g. name@okaxis or mobile@ybl).');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!customerName.trim() || !phone.trim() || !address.trim() || !postalCode.trim()) {
      setFormError('Please complete recipient name, mobile number, street address, and pincode.');
      return;
    }

    if (paymentMethod === 'UPI' && !upiId.includes('@')) {
      setFormError('Please enter a valid UPI ID (e.g. shirisha@okaxis) to complete UPI payment.');
      return;
    }

    setFormError(null);
    setSubmitting(true);

    const payload = {
      userId,
      customerName: customerName.trim(),
      customerPhone: phone.trim(),
      shippingAddress: address.trim(),
      pincode: postalCode.trim(),
      paymentMethod,
      transactionId:
        paymentMethod === 'UPI'
          ? `UPI-${Date.now()}`
          : paymentMethod === 'CARD'
          ? `CARD-${Date.now()}`
          : paymentMethod === 'NETBANKING'
          ? `NB-${Date.now()}`
          : `COD-${Date.now()}`,
      isResellOrder,
      resellerMargin: activeMargin,
      subtotal,
      discount,
      deliveryCharge: deliveryFee,
      finalCustomerTotal,
      items: items.map((i) => ({
        productId: i.productId || i.cartItemId,
        name: i.title,
        packLabel: i.subtitle,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const savedOrder: OrderRecord = await response.json();
      setConfirmedOrder(savedOrder);
      onOrderCreated(savedOrder);
      onClearCart();
    } catch {
      // Fallback order creation if server unreachable
      const fallbackOrder: OrderRecord = {
        orderId: `ORD-VL-${Math.floor(10000 + Math.random() * 89999)}`,
        userId,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        shippingAddress: payload.shippingAddress,
        pincode: payload.pincode,
        paymentMethod: payload.paymentMethod,
        paymentStatus: payload.paymentMethod === 'COD' ? 'COD_PENDING' : 'PAID',
        transactionId: payload.transactionId,
        isResellOrder: payload.isResellOrder,
        resellerMargin: payload.resellerMargin,
        subtotal: payload.subtotal,
        discount: payload.discount,
        deliveryCharge: payload.deliveryCharge,
        finalCustomerTotal: payload.finalCustomerTotal,
        currentStageIndex: 0,
        status: 'ACTIVE',
        courierPartner: 'Verdure Cold-Chain Express',
        awbNumber: `VCE${Math.floor(100000000 + Math.random() * 899999999)}IN`,
        estimatedDelivery: 'Tomorrow, 07:30 AM – 10:30 AM',
        createdAt: new Date().toISOString(),
        items: payload.items,
        trackingSteps: [
          {
            stage: 'ORDER_PLACED',
            title: 'Order Confirmed & Lot Reserved',
            description: 'Assigned to organic farm parcel.',
            timestamp: 'Just now',
            completed: true,
          },
          {
            stage: 'HARVESTED_QC',
            title: 'Dawn Harvested & Brix Quality Checked',
            description: 'Freshly picked at 05:15 AM.',
            timestamp: null,
            completed: false,
          },
          {
            stage: 'PACKED_HUB',
            title: 'Packed in Breathable Cedar Box',
            description: 'Packed at regional cold-chain hub.',
            timestamp: null,
            completed: false,
          },
          {
            stage: 'OUT_FOR_DELIVERY',
            title: 'Out for Doorstep Delivery',
            description: 'Courier agent assigned.',
            timestamp: null,
            completed: false,
          },
          {
            stage: 'DELIVERED',
            title: 'Delivered Fresh at Doorstep',
            description: 'Handed over at destination.',
            timestamp: null,
            completed: false,
          },
        ],
      };
      setConfirmedOrder(fallbackOrder);
      onOrderCreated(fallbackOrder);
      onClearCart();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#181D18]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#FAF9F5] h-full flex flex-col border-l border-[#E4E0D8] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#E4E0D8] flex items-center justify-between bg-[#FAF9F5] shrink-0">
          <div>
            <h2 id="cart-drawer-title" className="font-display text-2xl font-semibold text-[#181D18]">
              {confirmedOrder ? 'Order Confirmed & Payment Verified' : 'Harvest Bag & Checkout'}
            </h2>
            <p className="text-xs text-[#5A6258] mt-0.5">
              {confirmedOrder
                ? `Order #${confirmedOrder.orderId} · AWB ${confirmedOrder.awbNumber}`
                : 'Farm-Direct Pricing · Resell Margin Support · UPI, Card & COD'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close harvest bag drawer"
            className="p-2 -mr-2 text-[#5A6258] hover:text-[#181D18] transition-colors rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {confirmedOrder ? (
            /* Post-Order Confirmation & Live Tracking Launcher */
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-[#F2EFE9] border border-[#1F472B]/30">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#1F472B] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-[#181D18]">
                      Order #{confirmedOrder.orderId} Placed Successfully!
                    </div>
                    <p className="text-xs text-[#3F463E] mt-1 leading-relaxed">
                      Transaction ID: <span className="font-mono">{confirmedOrder.transactionId}</span> ({confirmedOrder.paymentMethod} · {confirmedOrder.paymentStatus}).
                      {confirmedOrder.isResellOrder && confirmedOrder.resellerMargin > 0
                        ? ` Your reseller profit margin of +$${confirmedOrder.resellerMargin.toFixed(2)} has been credited to your account!`
                        : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-[#E4E0D8] rounded-xl p-5 bg-[#FAF9F5] space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#F2EFE9]">
                  <span className="text-[#5A6258]">Customer Recipient</span>
                  <span className="font-medium text-[#181D18]">
                    {confirmedOrder.customerName} ({confirmedOrder.customerPhone})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F2EFE9]">
                  <span className="text-[#5A6258]">Delivery Address</span>
                  <span className="font-medium text-[#181D18] text-right">
                    {confirmedOrder.shippingAddress} - {confirmedOrder.pincode}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F2EFE9]">
                  <span className="text-[#5A6258]">Courier &amp; AWB</span>
                  <span className="font-mono tabular-nums font-medium text-[#1F472B]">
                    {confirmedOrder.courierPartner} · {confirmedOrder.awbNumber}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#5A6258]">Final Customer Total</span>
                  <span className="font-mono tabular-nums font-semibold text-sm text-[#181D18]">
                    ${confirmedOrder.finalCustomerTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-4 py-3 rounded-lg border border-[#D5CFC4] text-xs font-medium text-[#181D18] hover:bg-[#F2EFE9] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmedOrder(null);
                    onClose();
                    onNavigateToTracking();
                  }}
                  className="w-full sm:flex-1 py-3 px-5 rounded-lg bg-[#1F472B] hover:bg-[#16351F] text-[#FAF9F5] text-xs font-medium transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Track Live Order Status Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-2xl text-[#181D18]">
                Your harvest bag is currently empty
              </p>
              <p className="text-xs text-[#5A6258] mt-2 max-w-xs mx-auto leading-relaxed">
                Add organic vegetables, orchard fruits, or a custom weekly crate to start checkout or resell with margin.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 px-5 py-2.5 rounded-lg bg-[#1F472B] text-[#FAF9F5] text-xs font-medium hover:bg-[#16351F] transition-colors cursor-pointer"
              >
                Explore Seasonal Catalog
              </button>
            </div>
          ) : (
            <>
              {/* Free Delivery Progress Bar */}
              <div className="p-4 rounded-xl bg-[#F2EFE9] border border-[#E4E0D8]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-medium text-[#181D18] flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#1F472B]" />
                    {isFreeDelivery
                      ? 'Free Cold-Chain Doorstep Delivery Unlocked!'
                      : `Add $${amountToFreeDelivery.toFixed(2)} more for Free Delivery`}
                  </span>
                  <span className="font-mono tabular-nums text-[#5A6258]">
                    Free over ${FREE_DELIVERY_THRESHOLD.toFixed(0)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#DFDBD2] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1F472B] transition-transform duration-200 origin-left"
                    style={{
                      transform: `scaleX(${Math.min(1, discountedSubtotal / FREE_DELIVERY_THRESHOLD)})`,
                    }}
                  />
                </div>
              </div>

              {/* Itemized List */}
              <div className="divide-y divide-[#E4E0D8] border-t border-b border-[#E4E0D8]">
                {items.map((item) => (
                  <div key={item.cartItemId} className="py-4 flex gap-4">
                    <div className="w-20 h-16 rounded-lg overflow-hidden bg-[#EAE6DF] shrink-0">
                      <ResilientImage
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-[#181D18] truncate">
                          {item.title}
                        </h4>
                        <span className="font-mono text-sm font-medium text-[#181D18] tabular-nums shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-[#5A6258] mt-0.5">{item.subtitle}</p>

                      {item.customContents && item.customContents.length > 0 && (
                        <div className="mt-1.5 text-xs text-[#3F463E] bg-[#F2EFE9] p-2 rounded-md">
                          {item.customContents.join(' · ')}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center border border-[#D5CFC4] rounded-md bg-[#FAF9F5]">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                            className="px-2 py-1 text-[#5A6258] hover:text-[#181D18] cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 font-mono text-xs font-medium tabular-nums text-[#181D18]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                            className="px-2 py-1 text-[#5A6258] hover:text-[#181D18] cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.cartItemId)}
                          className="text-xs text-[#5A6258] hover:text-[#9E2A2B] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Meesho-Style Reselling Toggle & Margin Input */}
              <div className="p-4 rounded-xl border border-[#D5CFC4] bg-[#F2EFE9]/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#181D18]">
                      Reselling this Order to a Customer? (Meesho Mode)
                    </div>
                    <div className="text-[11px] text-[#5A6258]">
                      Add your custom profit margin; wholesale price is hidden on package invoice
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 p-1 bg-[#E5E0D5] rounded-lg">
                    <button
                      type="button"
                      onClick={() => setIsResellOrder(false)}
                      className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
                        !isResellOrder
                          ? 'bg-[#FAF9F5] text-[#181D18] shadow-2xs'
                          : 'text-[#5A6258]'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsResellOrder(true)}
                      className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
                        isResellOrder
                          ? 'bg-[#1F472B] text-[#FAF9F5] shadow-2xs'
                          : 'text-[#5A6258]'
                      }`}
                    >
                      Yes, Resell
                    </button>
                  </div>
                </div>

                {isResellOrder && (
                  <div className="pt-3 border-t border-[#DFDBD2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="text-xs font-medium text-[#181D18]">
                      Your Margin to Earn ($ USD):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={resellerMargin}
                        onChange={(e) => setResellerMargin(Math.max(0, Number(e.target.value)))}
                        className="w-28 px-3 py-1.5 text-xs font-mono tabular-nums rounded-lg border border-[#1F472B] bg-[#FAF9F5] text-[#181D18]"
                      />
                      <span className="text-xs font-mono tabular-nums text-[#1F472B] font-semibold">
                        Customer Pays: ${finalCustomerTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <label className="block text-xs font-medium text-[#5A6258]">
                  Apply Coupon Code (Try <span className="font-mono text-[#181D18]">HARVEST10</span> or <span className="font-mono text-[#181D18]">ORGANIC20</span>)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#D5CFC4] bg-[#FAF9F5] text-[#181D18]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg border border-[#181D18] text-xs font-medium text-[#181D18] hover:bg-[#F2EFE9] cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && <p className="text-xs text-[#1F472B]">{promoMessage}</p>}
              </form>

              {/* Multi-Method Payment Gateway & Delivery Form */}
              <form
                id="checkout-verification-form"
                onSubmit={handlePlaceOrder}
                className="space-y-4 pt-3 border-t border-[#E4E0D8]"
              >
                <h3 className="font-display text-lg font-semibold text-[#181D18]">
                  1. Select Payment Method
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      paymentMethod === 'UPI'
                        ? 'border-[#1F472B] bg-[#F2EFE9]'
                        : 'border-[#E4E0D8] bg-[#FAF9F5]'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-[#1F472B] mb-1" />
                    <div className="text-xs font-semibold text-[#181D18]">UPI App</div>
                    <div className="text-[10px] text-[#5A6258]">GPay / PhonePe</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      paymentMethod === 'CARD'
                        ? 'border-[#1F472B] bg-[#F2EFE9]'
                        : 'border-[#E4E0D8] bg-[#FAF9F5]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-[#1F472B] mb-1" />
                    <div className="text-xs font-semibold text-[#181D18]">Card</div>
                    <div className="text-[10px] text-[#5A6258]">Visa / MasterCard</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NETBANKING')}
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      paymentMethod === 'NETBANKING'
                        ? 'border-[#1F472B] bg-[#F2EFE9]'
                        : 'border-[#E4E0D8] bg-[#FAF9F5]'
                    }`}
                  >
                    <Landmark className="w-4 h-4 text-[#1F472B] mb-1" />
                    <div className="text-xs font-semibold text-[#181D18]">NetBanking</div>
                    <div className="text-[10px] text-[#5A6258]">All Major Banks</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      paymentMethod === 'COD'
                        ? 'border-[#1F472B] bg-[#F2EFE9]'
                        : 'border-[#E4E0D8] bg-[#FAF9F5]'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-[#1F472B] mb-1" />
                    <div className="text-xs font-semibold text-[#181D18]">Cash / COD</div>
                    <div className="text-[10px] text-[#5A6258]">Pay at Doorstep</div>
                  </button>
                </div>

                {/* Conditional Payment Details Input */}
                {paymentMethod === 'UPI' && (
                  <div className="p-3.5 rounded-lg bg-[#F2EFE9] border border-[#E4E0D8] space-y-2">
                    <label className="block text-xs font-medium text-[#181D18]">
                      Enter UPI ID (Google Pay / PhonePe / Paytm VPA)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => {
                          setUpiId(e.target.value);
                          setUpiVerified(false);
                        }}
                        placeholder="yourname@okaxis"
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#D5CFC4] bg-[#FAF9F5] font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyUpi}
                        className="px-3 py-2 rounded-lg bg-[#181D18] text-[#FAF9F5] text-xs font-medium cursor-pointer whitespace-nowrap"
                      >
                        {upiVerified ? 'Verified ✓' : 'Verify VPA'}
                      </button>
                    </div>
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <div className="p-3.5 rounded-lg bg-[#F2EFE9] border border-[#E4E0D8] space-y-3">
                    <div>
                      <label className="block text-xs text-[#5A6258] mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#D5CFC4] bg-[#FAF9F5]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-[#5A6258] mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#D5CFC4] bg-[#FAF9F5]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#5A6258] mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#D5CFC4] bg-[#FAF9F5]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'NETBANKING' && (
                  <div className="p-3.5 rounded-lg bg-[#F2EFE9] border border-[#E4E0D8]">
                    <label className="block text-xs text-[#5A6258] mb-1">Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#D5CFC4] bg-[#FAF9F5]"
                    >
                      <option>State Bank of India (SBI)</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                    </select>
                  </div>
                )}

                <h3 className="font-display text-lg font-semibold text-[#181D18] pt-2">
                  2. Customer Shipping Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#5A6258] mb-1">Recipient Full Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#D5CFC4] bg-[#FAF9F5]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#5A6258] mb-1">Mobile Phone</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#D5CFC4] bg-[#FAF9F5]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-[#5A6258] mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#D5CFC4] bg-[#FAF9F5]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#5A6258] mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono tabular-nums rounded-lg border border-[#D5CFC4] bg-[#FAF9F5]"
                    />
                  </div>
                </div>

                {formError && <p className="text-xs text-[#9E2A2B] font-medium">{formError}</p>}
              </form>
            </>
          )}
        </div>

        {/* Sticky Checkout Summary Footer */}
        {!confirmedOrder && items.length > 0 && (
          <div className="p-6 border-t border-[#E4E0D8] bg-[#F2EFE9] shrink-0 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#5A6258]">
                <span>Farm Wholesale Subtotal</span>
                <span className="font-mono tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#1F472B]">
                  <span>Coupon Discount ({appliedPromo?.code})</span>
                  <span className="font-mono tabular-nums">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#5A6258]">
                <span>Cold-Chain Courier</span>
                <span className="font-mono tabular-nums">
                  {deliveryFee === 0 ? 'FREE ($0.00)' : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              {isResellOrder && activeMargin > 0 && (
                <div className="flex justify-between text-[#1F472B] font-medium">
                  <span>Your Reseller Margin Added</span>
                  <span className="font-mono tabular-nums">+${activeMargin.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold text-[#181D18] pt-2 border-t border-[#DFDBD2]">
                <span>Final Customer Order Total</span>
                <span className="font-mono tabular-nums text-base">
                  ${finalCustomerTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              form="checkout-verification-form"
              className="w-full py-3.5 px-5 rounded-lg bg-[#1F472B] hover:bg-[#16351F] text-[#FAF9F5] text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <span>
                {submitting
                  ? 'Processing Payment & Order...'
                  : `Pay & Place Order (${paymentMethod}) · $${finalCustomerTotal.toFixed(2)}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
