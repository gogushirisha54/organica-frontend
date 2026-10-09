import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { ProduceProduct, ProduceVariant } from '../data/produceData';
import { ResilientImage } from './ResilientImage';

interface ProductDetailModalProps {
  product: ProduceProduct | null;
  onClose: () => void;
  onAddToCart: (product: ProduceProduct, variant: ProduceVariant, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'terroir' | 'storage' | 'pairing'>('terroir');
  const [justAdded, setJustAdded] = useState<boolean>(false);

  useEffect(() => {
    if (product && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
      setQuantity(1);
      setActiveTab('terroir');
      setJustAdded(false);
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (product) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const totalPrice = selectedVariant.price * quantity;

  const handleConfirmAdd = () => {
    onAddToCart(product, selectedVariant, quantity);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#181D18]/60 backdrop-blur-xs p-4 md:p-8 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-[#FAF9F5] border border-[#E4E0D8] rounded-xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with quiet field provenance & close action */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E0D8] bg-[#FAF9F5] shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#5A6258] truncate">
            <span>{product.parcelId}</span>
            <span aria-hidden="true">·</span>
            <span>{product.parcelLocation}</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline font-mono tabular-nums">
              Harvested {product.harvestTime}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="p-2 -mr-2 text-[#5A6258] hover:text-[#181D18] transition-colors rounded-lg focus-visible:outline-2 focus-visible:outline-[#1F472B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Contiguous Purchase Module Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          {/* Left Column: Sticky Gallery & Botanical Telemetry */}
          <div className="lg:col-span-6 p-6 md:p-8 bg-[#F2EFE9] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#E4E0D8]">
            <div>
              <div className="aspect-4/3 w-full rounded-lg overflow-hidden bg-[#EAE6DF]">
                <ResilientImage
                  src={product.image}
                  alt={product.name}
                  objectPosition={product.imageObjectPosition}
                  fallbackTitle={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Clean unboxed botanical caption */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5A6258] pt-3 border-t border-[#E4E0D8]">
                <span className="italic font-display text-sm text-[#181D18]">
                  {product.botanicalName}
                </span>
                <span className="font-mono tabular-nums text-[#1F472B] font-medium">
                  {product.brixLabel}
                </span>
              </div>
            </div>

            {/* Nutritional & Agronomic Ledger */}
            <div className="mt-6 pt-6 border-t border-[#E4E0D8]">
              <h4 className="text-xs font-semibold text-[#5A6258] mb-3">
                Lot Laboratory & Nutritional Assay
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {product.nutritionHighlights.map((item) => (
                  <div key={item.label} className="border-l-2 border-[#D5CFC4] pl-3">
                    <div className="text-xs text-[#5A6258]">{item.label}</div>
                    <div className="text-sm font-mono tabular-nums font-medium text-[#181D18] mt-0.5">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="lg:col-span-6 p-6 md:p-8 flex flex-col justify-between bg-[#FAF9F5]">
            <div>
              {/* Unboxed category & availability line */}
              <div className="flex items-center gap-2 text-xs text-[#5A6258]">
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#1F472B] font-medium">{product.availabilityText}</span>
              </div>

              {/* Title & Price */}
              <h2
                id="pdp-modal-title"
                className="font-display text-2xl md:text-3xl font-semibold text-[#181D18] mt-2 text-balance leading-tight"
              >
                {product.name}
              </h2>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-mono text-2xl font-medium text-[#181D18] tabular-nums">
                  ${selectedVariant.price.toFixed(2)}
                </span>
                <span className="text-xs text-[#5A6258]">
                  per {selectedVariant.weightLabel}
                </span>
              </div>

              <p className="mt-4 text-sm text-[#3F463E] leading-relaxed">
                {product.description}
              </p>

              {/* Variant Selector */}
              <div className="mt-6">
                <label className="block text-xs font-semibold text-[#181D18] mb-2">
                  Select Harvest Pack Size
                </label>
                <div className="space-y-2">
                  {product.variants.map((variant) => {
                    const isSelected = variant.id === selectedVariant.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-colors ${
                          isSelected
                            ? 'border-[#1F472B] bg-[#F2EFE9] text-[#181D18]'
                            : 'border-[#E4E0D8] bg-[#FAF9F5] text-[#5A6258] hover:border-[#C5BFB3] hover:text-[#181D18]'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-medium text-[#181D18]">
                            {variant.label}
                          </div>
                          <div className="text-xs text-[#5A6258] mt-0.5">
                            Net Weight: {variant.weightLabel}
                            {variant.savingsNote ? ` · ${variant.savingsNote}` : ''}
                          </div>
                        </div>
                        <div className="font-mono text-sm font-medium text-[#181D18] tabular-nums">
                          ${variant.price.toFixed(2)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Segmented Tabs for Terroir, Storage & Pairing */}
              <div className="mt-6 pt-6 border-t border-[#E4E0D8]">
                <div className="flex items-center gap-1 p-1 bg-[#F2EFE9] rounded-lg">
                  <button
                    type="button"
                    onClick={() => setActiveTab('terroir')}
                    className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      activeTab === 'terroir'
                        ? 'bg-[#FAF9F5] text-[#181D18] shadow-2xs'
                        : 'text-[#5A6258] hover:text-[#181D18]'
                    }`}
                  >
                    Tasting & Soil
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('storage')}
                    className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      activeTab === 'storage'
                        ? 'bg-[#FAF9F5] text-[#181D18] shadow-2xs'
                        : 'text-[#5A6258] hover:text-[#181D18]'
                    }`}
                  >
                    Storage Care
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('pairing')}
                    className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      activeTab === 'pairing'
                        ? 'bg-[#FAF9F5] text-[#181D18] shadow-2xs'
                        : 'text-[#5A6258] hover:text-[#181D18]'
                    }`}
                  >
                    Kitchen Pairing
                  </button>
                </div>

                <div className="mt-3 text-xs text-[#3F463E] leading-relaxed min-h-[4.5rem]">
                  {activeTab === 'terroir' && (
                    <div>
                      <p className="font-medium text-[#181D18]">
                        Palate: {product.tastingNotes}
                      </p>
                      <p className="mt-1 text-[#5A6258]">
                        Terroir: {product.soilProfile}
                      </p>
                    </div>
                  )}
                  {activeTab === 'storage' && <p>{product.storageGuide}</p>}
                  {activeTab === 'pairing' && <p>{product.culinaryPairing}</p>}
                </div>
              </div>
            </div>

            {/* Contiguous Purchase Action Bar */}
            <div className="mt-6 pt-5 border-t border-[#E4E0D8] flex items-center gap-4">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-[#D5CFC4] rounded-lg bg-[#FAF9F5]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-3 text-[#5A6258] hover:text-[#181D18] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 font-mono text-sm font-medium tabular-nums text-[#181D18] min-w-[2.25rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="p-3 text-[#5A6258] hover:text-[#181D18] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Primary Add CTA */}
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="flex-1 py-3 px-5 rounded-lg bg-[#1F472B] hover:bg-[#16351F] text-[#FAF9F5] text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Harvest Bag · ${totalPrice.toFixed(2)}</span>
                  </>
                ) : (
                  <span>
                    Add to Harvest Bag · ${totalPrice.toFixed(2)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
