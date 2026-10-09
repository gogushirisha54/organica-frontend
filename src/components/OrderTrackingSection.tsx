import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  Search,
  RotateCcw,
  Printer,
  ArrowRight,
  PackageCheck,
} from 'lucide-react';
import { ResilientImage } from './ResilientImage';

export interface OrderTrackingStep {
  stage: 'ORDER_PLACED' | 'HARVESTED_QC' | 'PACKED_HUB' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  title: string;
  description: string;
  timestamp: string | null;
  completed: boolean;
}

export interface OrderRecord {
  orderId: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  pincode: string;
  paymentMethod: 'UPI' | 'CARD' | 'COD' | 'NETBANKING';
  paymentStatus: 'PAID' | 'COD_PENDING' | 'REFUNDED';
  transactionId: string;
  isResellOrder: boolean;
  resellerMargin: number;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  finalCustomerTotal: number;
  currentStageIndex: number;
  status: 'ACTIVE' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED';
  courierPartner: string;
  awbNumber: string;
  estimatedDelivery: string;
  createdAt: string;
  items: {
    productId: string;
    name: string;
    packLabel: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  trackingSteps: OrderTrackingStep[];
}

interface OrderTrackingSectionProps {
  orders: OrderRecord[];
  onAdvanceOrderStage: (orderId: string) => Promise<void>;
  onCancelOrReturnOrder: (orderId: string) => Promise<void>;
  onBackToCatalog: () => void;
}

export const OrderTrackingSection: React.FC<OrderTrackingSectionProps> = ({
  orders,
  onAdvanceOrderStage,
  onCancelOrReturnOrder,
  onBackToCatalog,
}) => {
  const [trackingQuery, setTrackingQuery] = useState('');
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    const q = trackingQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      o.orderId.toLowerCase().includes(q) ||
      o.awbNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.items.some((i) => i.name.toLowerCase().includes(q))
    );
  });

  const handleAdvance = async (orderId: string) => {
    setBusyOrderId(orderId);
    try {
      await onAdvanceOrderStage(orderId);
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    setBusyOrderId(orderId);
    try {
      await onCancelOrReturnOrder(orderId);
    } finally {
      setBusyOrderId(null);
    }
  };

  return (
    <section id="track-orders" className="py-12 md:py-16 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header & Search by Order ID / AWB */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E4E0D8]">
          <div>
            <div className="text-xs text-[#5A6258] font-medium">
              Live Cold-Chain Telemetry · Spring Boot OrderController (/api/orders)
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#181D18] mt-2 text-balance">
              Track Your Orders &amp; Reseller Shipments
            </h2>
            <p className="mt-2 text-sm text-[#3F463E] max-w-2xl">
              Follow every organic harvest lot from dawn field picking through hydro-cooling,
              regional hub packing, and last-mile doorstep delivery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#5A6258] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                placeholder="Search Order ID or AWB..."
                className="pl-9 pr-4 py-2 text-xs rounded-lg border border-[#D5CFC4] bg-[#FAF9F5] text-[#181D18] w-64 focus:outline-2 focus:outline-[#1F472B]"
              />
            </div>
            <button
              type="button"
              onClick={onBackToCatalog}
              className="px-4 py-2 rounded-lg border border-[#D5CFC4] hover:border-[#181D18] text-xs font-medium text-[#181D18] transition-colors cursor-pointer whitespace-nowrap"
            >
              Continue Shopping
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="mt-10 p-12 rounded-xl border border-[#E4E0D8] bg-[#F2EFE9] text-center">
            <PackageCheck className="w-8 h-8 text-[#1F472B] mx-auto mb-3" />
            <h3 className="font-display text-2xl font-semibold text-[#181D18]">
              No matching orders found
            </h3>
            <p className="text-xs text-[#5A6258] mt-1">
              Place a new order from the Seasonal Catalog or clear your Order ID filter.
            </p>
            <button
              type="button"
              onClick={onBackToCatalog}
              className="mt-5 px-5 py-2.5 rounded-lg bg-[#1F472B] text-[#FAF9F5] text-xs font-medium hover:bg-[#16351F] transition-colors cursor-pointer"
            >
              Explore Organic Produce
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {filteredOrders.map((order) => {
              const isCancelled = order.status === 'CANCELLED';
              const isReturned = order.status === 'RETURN_REQUESTED';
              const isDelivered = order.status === 'DELIVERED' || order.currentStageIndex >= 4;

              return (
                <article
                  key={order.orderId}
                  className="rounded-xl border border-[#E4E0D8] bg-[#FAF9F5] overflow-hidden"
                >
                  {/* Order Top Metadata Bar */}
                  <div className="p-5 sm:px-6 bg-[#F2EFE9] border-b border-[#E4E0D8] flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#5A6258]">
                        <span className="font-mono font-semibold text-[#181D18] text-sm tabular-nums">
                          {order.orderId}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>AWB: <strong className="font-mono tabular-nums text-[#181D18]">{order.awbNumber}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Courier: {order.courierPartner}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Payment: <strong className="text-[#181D18]">{order.paymentMethod} ({order.paymentStatus})</strong>
                        </span>
                      </div>
                      <div className="text-xs text-[#3F463E]">
                        Delivering to: <span className="font-medium text-[#181D18]">{order.customerName}</span> ({order.customerPhone}) — {order.shippingAddress}, Pincode <span className="font-mono tabular-nums">{order.pincode}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {order.isResellOrder && order.resellerMargin > 0 && (
                        <div className="text-xs font-mono tabular-nums text-[#1F472B] font-semibold">
                          Reseller Margin Earned: +${order.resellerMargin.toFixed(2)}
                        </div>
                      )}
                      <div className="text-right font-mono tabular-nums">
                        <div className="text-xs text-[#5A6258]">Customer Total</div>
                        <div className="text-base font-semibold text-[#181D18]">
                          ${order.finalCustomerTotal.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5-Stage Visual Tracking Stepper */}
                  <div className="p-6 border-b border-[#E4E0D8]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                      <div>
                        <span className="text-xs font-semibold text-[#181D18]">
                          Status:{' '}
                          {isCancelled
                            ? 'Order Cancelled & Refund Initiated'
                            : isReturned
                            ? 'Quality Replacement / Return Requested'
                            : isDelivered
                            ? 'Delivered Fresh at Doorstep'
                            : `In Transit — ${order.trackingSteps[order.currentStageIndex]?.title}`}
                        </span>
                        <span className="text-xs text-[#5A6258] ml-2">
                          · ETA: {order.estimatedDelivery}
                        </span>
                      </div>

                      {/* Interactive Stage Advance Button for Testing/Demo */}
                      <div className="flex items-center gap-2">
                        {!isCancelled && !isReturned && !isDelivered && (
                          <button
                            type="button"
                            disabled={busyOrderId === order.orderId}
                            onClick={() => handleAdvance(order.orderId)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#1F472B] hover:bg-[#16351F] text-[#FAF9F5] text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Simulate Next Tracking Stage</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {!isCancelled && !isReturned && (
                          <button
                            type="button"
                            disabled={busyOrderId === order.orderId}
                            onClick={() => handleCancel(order.orderId)}
                            className="px-3 py-1.5 rounded-lg border border-[#D5CFC4] hover:border-[#9E2A2B] hover:text-[#9E2A2B] text-xs font-medium text-[#5A6258] transition-colors inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{isDelivered ? 'Request Easy Return' : 'Cancel Order'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="px-3 py-1.5 rounded-lg border border-[#D5CFC4] hover:border-[#181D18] text-xs font-medium text-[#181D18] transition-colors inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Tax Invoice</span>
                        </button>
                      </div>
                    </div>

                    {/* Timeline Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {order.trackingSteps.map((step, index) => {
                        const isCompleted = step.completed && !isCancelled;
                        const isCurrent = index === order.currentStageIndex && !isCancelled;

                        return (
                          <div
                            key={step.stage}
                            className={`p-4 rounded-lg border transition-colors ${
                              isCurrent
                                ? 'border-[#1F472B] bg-[#F2EFE9]'
                                : isCompleted
                                ? 'border-[#D5CFC4] bg-[#FAF9F5]'
                                : 'border-[#E4E0D8] bg-[#FAF9F5]/50 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs font-semibold tabular-nums text-[#5A6258]">
                                0{index + 1}
                              </span>
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-[#1F472B]" />
                              ) : (
                                <Clock className="w-4 h-4 text-[#8C9289]" />
                              )}
                            </div>
                            <h4 className="text-xs font-semibold text-[#181D18] mt-2 leading-snug">
                              {step.title}
                            </h4>
                            <p className="text-[11px] text-[#5A6258] mt-1 leading-relaxed">
                              {step.description}
                            </p>
                            {step.timestamp && (
                              <div className="mt-2 pt-2 border-t border-[#E4E0D8] font-mono text-[11px] tabular-nums text-[#1F472B]">
                                {step.timestamp}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Line Items */}
                  <div className="p-5 sm:px-6 bg-[#FAF9F5] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items.map((item, idx) => (
                      <div
                        key={`${order.orderId}-item-${idx}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-[#E4E0D8] bg-[#F2EFE9]/50"
                      >
                        <div className="w-14 h-12 rounded-md overflow-hidden bg-[#EAE6DF] shrink-0">
                          <ResilientImage
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-[#181D18] truncate">
                            {item.quantity}× {item.name}
                          </div>
                          <div className="text-[11px] text-[#5A6258] truncate">
                            {item.packLabel}
                          </div>
                          <div className="text-xs font-mono tabular-nums font-medium text-[#181D18] mt-0.5">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
