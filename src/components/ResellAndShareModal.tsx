import React, { useState, useEffect } from 'react';
import { X, Share2, Copy, Check, ShoppingBag } from 'lucide-react';
import { ProduceProduct } from '../data/produceData';
import { ResilientImage } from './ResilientImage';

interface ResellAndShareModalProps {
  product: ProduceProduct | null;
  onClose: () => void;
  onStartResellCheckout: (product: ProduceProduct, marginAmount: number) => void;
}

export const ResellAndShareModal: React.FC<ResellAndShareModalProps> = ({
  product,
  onClose,
  onStartResellCheckout,
}) => {
  const [marginAmount, setMarginAmount] = useState<number>(4.0);
  const [copiedCatalog, setCopiedCatalog] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setMarginAmount(Number((product.price * 0.25).toFixed(2)));
      setCopiedCatalog(false);
    }
  }, [product]);

  if (!product) return null;

  const finalCustomerPrice = Number((product.price + marginAmount).toFixed(2));
  const marginPercent = Math.round((marginAmount / product.price) * 100);

  const shareableCatalogText = `🌿 Fresh Certified Organic Harvest: ${product.name} (${product.unit})
✨ Botanical Variety: ${product.botanicalName}
🍯 Sweetness & Quality: ${product.brixLabel} · Picked at Dawn (${product.harvestTime})
🥗 Tasting Notes: ${product.tastingNotes}
💰 Price: $${finalCustomerPrice.toFixed(2)} (Free Cold-Chain Doorstep Delivery Available)
📩 Reply to book your morning farm lot!`;

  const handleCopyShareText = () => {
    navigator.clipboard?.writeText(shareableCatalogText);
    setCopiedCatalog(true);
    setTimeout(() => setCopiedCatalog(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#181D18]/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resell-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#FAF9F5] border border-[#E4E0D8] rounded-xl overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E4E0D8] flex items-center justify-between bg-[#F2EFE9]">
          <div>
            <h2 id="resell-modal-title" className="font-display text-2xl font-semibold text-[#181D18]">
              Resell &amp; Earn Margin
            </h2>
            <p className="text-xs text-[#5A6258]">
              Share farm-direct organic produce with your customers and earn 100% of the added margin
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close resell modal"
            className="p-2 text-[#5A6258] hover:text-[#181D18] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Product Summary */}
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-[#F2EFE9] border border-[#E4E0D8]">
            <div className="w-20 h-16 rounded-lg overflow-hidden bg-[#EAE6DF] shrink-0">
              <ResilientImage
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-[#5A6258]">{product.shortCategory} · {product.unit}</div>
              <h3 className="text-sm font-semibold text-[#181D18] truncate mt-0.5">
                {product.name}
              </h3>
              <div className="text-xs font-mono tabular-nums text-[#1F472B] font-medium mt-1">
                Farm Wholesale Price: ${product.price.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Margin Configurator */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <label htmlFor="margin-input" className="font-semibold text-[#181D18]">
                Set Your Reseller Profit Margin ($ USD)
              </label>
              <span className="font-mono tabular-nums text-[#1F472B] font-medium">
                +{marginPercent}% Margin
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[2.0, 3.5, 5.0, 8.0].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMarginAmount(preset)}
                  className={`px-3 py-2 rounded-lg border text-xs font-mono tabular-nums transition-colors cursor-pointer ${
                    marginAmount === preset
                      ? 'border-[#1F472B] bg-[#F2EFE9] font-semibold text-[#181D18]'
                      : 'border-[#D5CFC4] text-[#5A6258] hover:text-[#181D18]'
                  }`}
                >
                  +${preset.toFixed(2)}
                </button>
              ))}
              <input
                id="margin-input"
                type="number"
                min={0}
                step={0.5}
                value={marginAmount}
                onChange={(e) => setMarginAmount(Math.max(0, Number(e.target.value)))}
                className="flex-1 px-3 py-2 text-xs font-mono tabular-nums rounded-lg border border-[#D5CFC4] bg-[#FAF9F5] text-[#181D18]"
              />
            </div>
          </div>

          {/* Price Breakdown Box */}
          <div className="p-4 rounded-xl border border-[#E4E0D8] bg-[#FAF9F5] space-y-2 text-xs">
            <div className="flex justify-between text-[#5A6258]">
              <span>Verdure &amp; Loam Farm Price</span>
              <span className="font-mono tabular-nums">${product.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#1F472B] font-medium">
              <span>Your Reseller Earnings (Credited on Delivery)</span>
              <span className="font-mono tabular-nums">+${marginAmount.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-[#E4E0D8] flex justify-between text-sm font-semibold text-[#181D18]">
              <span>Final Customer Price (Shown on COD / Share Link)</span>
              <span className="font-mono tabular-nums">${finalCustomerPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Shareable Catalog Preview */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-[#181D18]">
                Customer Catalog Description (Farm Wholesale Price Hidden)
              </span>
              <button
                type="button"
                onClick={handleCopyShareText}
                className="text-[#1F472B] hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
              >
                {copiedCatalog ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCatalog ? 'Copied Catalog Text' : 'Copy for WhatsApp / Catalog'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-[#F2EFE9] border border-[#E4E0D8] text-[11px] font-sans text-[#3F463E] whitespace-pre-wrap leading-relaxed">
              {shareableCatalogText}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopyShareText}
              className="w-full sm:w-auto px-4 py-3 rounded-lg border border-[#D5CFC4] hover:border-[#181D18] text-xs font-medium text-[#181D18] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedCatalog ? 'Catalog Copied!' : 'Share Catalog Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => onStartResellCheckout(product, marginAmount)}
              className="w-full sm:flex-1 py-3 px-5 rounded-lg bg-[#1F472B] hover:bg-[#16351F] text-[#FAF9F5] text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                Order for Customer (Earn +${marginAmount.toFixed(2)})
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
