import React, { useState, useMemo } from 'react';
import { Plus, Minus, Check, RotateCcw, Sparkles } from 'lucide-react';
import {
  CUSTOM_BOX_TIERS,
  BOX_PRODUCE_SLOTS,
  CustomBoxTier,
} from '../data/produceData';
import { ResilientImage } from './ResilientImage';

export interface ConfiguredCustomBox {
  tier: CustomBoxTier;
  cadence: 'one-time' | 'weekly' | 'biweekly';
  finalPrice: number;
  totalWeightLbs: number;
  items: {
    slotId: string;
    name: string;
    unitLabel: string;
    count: number;
  }[];
}

interface CustomBoxBuilderProps {
  onAddCustomBoxToCart: (box: ConfiguredCustomBox) => void;
}

export const CustomBoxBuilder: React.FC<CustomBoxBuilderProps> = ({
  onAddCustomBoxToCart,
}) => {
  const [selectedTierId, setSelectedTierId] = useState<'petite' | 'family' | 'cellar'>('family');
  const [cadence, setCadence] = useState<'one-time' | 'weekly' | 'biweekly'>('weekly');
  const [slotFilter, setSlotFilter] = useState<'All' | 'Vegetable' | 'Fruit' | 'Greens & Herbs'>('All');
  const [addedNotification, setAddedNotification] = useState(false);

  // Default balanced 8-slot Family Table selection
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({
    'slot-heirloom-tom': 2,
    'slot-rainbow-carrots': 1,
    'slot-tuscan-kale': 1,
    'slot-blood-oranges': 1,
    'slot-mission-figs': 1,
    'slot-globe-artichokes': 1,
    'slot-meyer-lemons': 1,
  });

  const currentTier = useMemo(
    () => CUSTOM_BOX_TIERS.find((t) => t.id === selectedTierId) || CUSTOM_BOX_TIERS[1],
    [selectedTierId]
  );

  const totalFilledSlots = useMemo(
    () => Object.values(slotCounts).reduce((sum, count) => sum + count, 0),
    [slotCounts]
  );

  const handleSelectTier = (tier: CustomBoxTier) => {
    setSelectedTierId(tier.id);
    // If current filled slots exceed the new tier's slot cap, trim gracefully
    if (totalFilledSlots > tier.slots) {
      let remainingAllowed = tier.slots;
      const adjusted: Record<string, number> = {};
      for (const [key, count] of Object.entries(slotCounts)) {
        if (remainingAllowed <= 0) break;
        const take = Math.min(count, remainingAllowed);
        if (take > 0) {
          adjusted[key] = take;
          remainingAllowed -= take;
        }
      }
      setSlotCounts(adjusted);
    }
  };

  const handleIncrementSlot = (slotId: string) => {
    if (totalFilledSlots >= currentTier.slots) return;
    setSlotCounts((prev) => ({
      ...prev,
      [slotId]: (prev[slotId] || 0) + 1,
    }));
  };

  const handleDecrementSlot = (slotId: string) => {
    setSlotCounts((prev) => {
      const current = prev[slotId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[slotId];
        return next;
      }
      return { ...prev, [slotId]: current - 1 };
    });
  };

  const handleAutoCurate = () => {
    const targetSlots = currentTier.slots;
    const curated: Record<string, number> = {};
    let count = 0;
    let index = 0;
    while (count < targetSlots) {
      const item = BOX_PRODUCE_SLOTS[index % BOX_PRODUCE_SLOTS.length];
      curated[item.id] = (curated[item.id] || 0) + 1;
      count++;
      index++;
    }
    setSlotCounts(curated);
  };

  const handleClearCrate = () => {
    setSlotCounts({});
  };

  const filteredSlots = useMemo(() => {
    if (slotFilter === 'All') return BOX_PRODUCE_SLOTS;
    return BOX_PRODUCE_SLOTS.filter((item) => item.type === slotFilter);
  }, [slotFilter]);

  // Metrics calculation
  const { totalWeightLbs, aLaCarteValue, finalCratePrice, nutrientProfile } = useMemo(() => {
    let weight = 0;
    let retail = 0;
    const nutrients = {
      Antioxidants: 0,
      'Vitamin C': 0,
      'Folate & Iron': 0,
      'Prebiotic Fiber': 0,
    };

    for (const item of BOX_PRODUCE_SLOTS) {
      const qty = slotCounts[item.id] || 0;
      if (qty > 0) {
        weight += item.weightLbs * qty;
        retail += item.retailValue * qty;
        nutrients[item.nutrientFocus] += qty;
      }
    }

    const discountMultiplier =
      cadence === 'weekly' ? 0.9 : cadence === 'biweekly' ? 0.95 : 1.0;
    const finalPrice = Number((currentTier.basePrice * discountMultiplier).toFixed(2));

    return {
      totalWeightLbs: weight,
      aLaCarteValue: retail,
      finalCratePrice: finalPrice,
      nutrientProfile: nutrients,
    };
  }, [slotCounts, currentTier, cadence]);

  const remainingSlots = currentTier.slots - totalFilledSlots;
  const isCrateComplete = totalFilledSlots === currentTier.slots;
  const estimatedSavings = Math.max(0, aLaCarteValue - finalCratePrice);

  const handleCommitBox = () => {
    if (totalFilledSlots === 0) return;
    const items = BOX_PRODUCE_SLOTS.filter((s) => (slotCounts[s.id] || 0) > 0).map(
      (s) => ({
        slotId: s.id,
        name: s.name,
        unitLabel: s.unitLabel,
        count: slotCounts[s.id],
      })
    );

    onAddCustomBoxToCart({
      tier: currentTier,
      cadence,
      finalPrice: finalCratePrice,
      totalWeightLbs,
      items,
    });

    setAddedNotification(true);
    setTimeout(() => setAddedNotification(false), 1800);
  };

  return (
    <section
      id="custom-box"
      className="py-16 md:py-24 border-t border-[#E4E0D8] bg-[#F2EFE9]"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-[#DFDBD2]">
          <div>
            <div className="text-xs text-[#5A6258] font-medium">
              02. Bespoke Weekly Provisioning · Direct Field Allocation
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#181D18] mt-2 text-balance">
              Build Your Custom Dawn Harvest Crate
            </h2>
            <p className="mt-3 text-sm md:text-base text-[#3F463E] max-w-2xl leading-relaxed">
              Select your cedar crate capacity and allocate each slot to exact organic vegetables
              and orchard fruits picked before sunrise. Modify or pause your allocation any
              Wednesday before 6:00 PM.
            </p>
          </div>

          {/* Cadence Segmented Selector */}
          <div className="flex flex-col sm:items-end gap-2">
            <span className="text-xs text-[#5A6258]">Select Harvest Frequency</span>
            <div className="inline-flex items-center gap-1 p-1 bg-[#E5E0D5] rounded-lg">
              <button
                type="button"
                onClick={() => setCadence('one-time')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  cadence === 'one-time'
                    ? 'bg-[#FAF9F5] text-[#181D18] shadow-2xs'
                    : 'text-[#4E564C] hover:text-[#181D18]'
                }`}
              >
                Single Crate
              </button>
              <button
                type="button"
                onClick={() => setCadence('biweekly')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  cadence === 'biweekly'
                    ? 'bg-[#FAF9F5] text-[#181D18] shadow-2xs'
                    : 'text-[#4E564C] hover:text-[#181D18]'
                }`}
              >
                Bi-Weekly (-5%)
              </button>
              <button
                type="button"
                onClick={() => setCadence('weekly')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  cadence === 'weekly'
                    ? 'bg-[#FAF9F5] text-[#181D18] shadow-2xs'
                    : 'text-[#4E564C] hover:text-[#181D18]'
                }`}
              >
                Weekly Drop (-10%)
              </button>
            </div>
          </div>
        </div>

        {/* Step 1: Select Crate Size */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {CUSTOM_BOX_TIERS.map((tier) => {
            const isSelected = tier.id === selectedTierId;
            const discountedPrice =
              cadence === 'weekly'
                ? tier.basePrice * 0.9
                : cadence === 'biweekly'
                ? tier.basePrice * 0.95
                : tier.basePrice;

            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => handleSelectTier(tier)}
                className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FAF9F5] border-[#1F472B] shadow-xs'
                    : 'bg-[#FAF9F5]/60 border-[#DFDBD2] hover:bg-[#FAF9F5] hover:border-[#C5BFB3]'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-xl font-semibold text-[#181D18]">
                    {tier.name}
                  </span>
                  <span className="font-mono text-base font-medium text-[#181D18] tabular-nums">
                    ${discountedPrice.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-[#5A6258] font-mono tabular-nums">
                  <span>{tier.slots} Harvest Slots</span>
                  <span aria-hidden="true">·</span>
                  <span>Est. {tier.estimatedWeight}</span>
                </div>
                <p className="mt-2 text-xs text-[#3F463E]">{tier.idealFor}</p>
              </button>
            );
          })}
        </div>

        {/* Main Configurator Workspace: Left Slot Grid + Right Live Crate Manifest */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 8 Columns: Produce Slot Picker */}
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              {/* Filter Controls */}
              <div className="inline-flex items-center gap-1 p-1 bg-[#E5E0D5] rounded-lg">
                {(['All', 'Vegetable', 'Fruit', 'Greens & Herbs'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSlotFilter(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      slotFilter === cat
                        ? 'bg-[#FAF9F5] text-[#181D18] shadow-2xs'
                        : 'text-[#4E564C] hover:text-[#181D18]'
                    }`}
                  >
                    {cat === 'All' ? 'All Field Lots' : cat}
                  </button>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={handleAutoCurate}
                  className="inline-flex items-center gap-1.5 text-[#1F472B] hover:underline font-medium cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Fill Peak Dawn Harvest</span>
                </button>
                <span aria-hidden="true" className="text-[#C5BFB3]">·</span>
                <button
                  type="button"
                  onClick={handleClearCrate}
                  className="inline-flex items-center gap-1 text-[#5A6258] hover:text-[#181D18] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Slots</span>
                </button>
              </div>
            </div>

            {/* Slot Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSlots.map((item) => {
                const count = slotCounts[item.id] || 0;
                const canAdd = totalFilledSlots < currentTier.slots;

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl bg-[#FAF9F5] border transition-colors overflow-hidden flex flex-col justify-between ${
                      count > 0 ? 'border-[#1F472B]' : 'border-[#E4E0D8]'
                    }`}
                  >
                    <div>
                      <div className="aspect-4/3 w-full bg-[#EAE6DF] overflow-hidden relative">
                        <ResilientImage
                          src={item.image}
                          alt={item.name}
                          fallbackTitle={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-4">
                        <div className="flex items-center gap-1.5 text-xs text-[#5A6258]">
                          <span>{item.variety}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{item.brix}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-[#181D18] mt-1 leading-snug">
                          {item.name}
                        </h3>
                        <div className="mt-1 text-xs text-[#5A6258] font-mono tabular-nums">
                          {item.unitLabel} · Value ${item.retailValue.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Slot Stepper Footer */}
                    <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-[#F2EFE9]">
                      <span className="text-xs text-[#5A6258]">
                        {count > 0 ? `${count} slot${count > 1 ? 's' : ''} allocated` : '1 slot'}
                      </span>

                      <div className="flex items-center gap-2">
                        {count > 0 && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDecrementSlot(item.id)}
                              aria-label={`Remove ${item.name} from crate`}
                              className="w-7 h-7 rounded-md border border-[#D5CFC4] flex items-center justify-center text-[#181D18] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-mono text-xs font-semibold tabular-nums w-4 text-center">
                              {count}
                            </span>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => handleIncrementSlot(item.id)}
                          disabled={!canAdd}
                          aria-label={`Add ${item.name} to crate`}
                          className={`px-2.5 h-7 rounded-md text-xs font-medium flex items-center gap-1 transition-colors whitespace-nowrap ${
                            canAdd
                              ? 'bg-[#1F472B] text-[#FAF9F5] hover:bg-[#16351F] cursor-pointer'
                              : 'bg-[#E5E0D5] text-[#8C9289] cursor-not-allowed'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{count === 0 ? 'Add' : ''}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 4 Columns: Live Crate Manifest & Phytonutrient Summary */}
          <div className="lg:col-span-4 bg-[#FAF9F5] border border-[#E4E0D8] rounded-xl p-6 sticky top-24">
            <div className="flex items-baseline justify-between border-b border-[#E4E0D8] pb-4">
              <div>
                <h3 className="font-display text-xl font-semibold text-[#181D18]">
                  {currentTier.name}
                </h3>
                <p className="text-xs text-[#5A6258] mt-0.5">
                  {cadence === 'weekly'
                    ? 'Weekly Thursday Dawn Delivery'
                    : cadence === 'biweekly'
                    ? 'Bi-Weekly Thursday Dawn Delivery'
                    : 'One-Time Dawn Harvest Dispatch'}
                </p>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-lg font-semibold text-[#181D18]">
                  ${finalCratePrice.toFixed(2)}
                </div>
                {estimatedSavings > 0 && (
                  <div className="text-xs text-[#1F472B]">
                    Save ${estimatedSavings.toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            {/* Slot Capacity Progress Bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium text-[#181D18]">
                  Crate Slot Allocation
                </span>
                <span className="font-mono tabular-nums text-[#5A6258]">
                  {totalFilledSlots} / {currentTier.slots} slots ({totalWeightLbs.toFixed(1)} lbs)
                </span>
              </div>
              <div className="w-full h-2 bg-[#EAE6DF] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1F472B] transition-transform duration-200 origin-left"
                  style={{
                    transform: `scaleX(${Math.min(1, totalFilledSlots / currentTier.slots)})`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-[#5A6258]">
                {isCrateComplete
                  ? 'Crate capacity complete and ready for dawn harvest.'
                  : remainingSlots === currentTier.slots
                  ? 'Select organic produce lots on the left to fill your crate.'
                  : `Add ${remainingSlots} more slot${remainingSlots > 1 ? 's' : ''} to reach full crate capacity, or lock in your current selection now.`}
              </p>
            </div>

            {/* Selected Items Manifest */}
            <div className="mt-5 pt-4 border-t border-[#E4E0D8] max-h-60 overflow-y-auto space-y-2.5">
              {totalFilledSlots === 0 ? (
                <div className="py-6 text-center text-xs text-[#5A6258]">
                  Your cedar crate is currently empty. Click “Add” on any harvest lot or use “Auto-Fill Peak Dawn Harvest”.
                </div>
              ) : (
                BOX_PRODUCE_SLOTS.filter((s) => (slotCounts[s.id] || 0) > 0).map((s) => {
                  const qty = slotCounts[s.id];
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between text-xs gap-2 py-1"
                    >
                      <div className="truncate">
                        <span className="font-medium text-[#181D18]">{s.name}</span>
                        <span className="text-[#5A6258] ml-1.5 font-mono tabular-nums">
                          ({s.unitLabel})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDecrementSlot(s.id)}
                          aria-label={`Decrease ${s.name}`}
                          className="text-[#5A6258] hover:text-[#181D18] px-1 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono tabular-nums font-medium text-[#181D18]">
                          ×{qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleIncrementSlot(s.id)}
                          disabled={totalFilledSlots >= currentTier.slots}
                          aria-label={`Increase ${s.name}`}
                          className="text-[#5A6258] hover:text-[#181D18] disabled:opacity-30 px-1 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Phytonutrient Balance Readout */}
            <div className="mt-5 pt-4 border-t border-[#E4E0D8]">
              <div className="text-xs font-medium text-[#181D18] mb-2">
                Phytonutrient Spectrum in Your Crate
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {Object.entries(nutrientProfile).map(([nutrient, count]) => (
                  <div
                    key={nutrient}
                    className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-[#F2EFE9]"
                  >
                    <span className="text-[#3F463E] truncate">{nutrient}</span>
                    <span className="font-mono tabular-nums font-medium text-[#1F472B]">
                      {count} {count === 1 ? 'lot' : 'lots'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Add Custom Crate CTA */}
            <button
              type="button"
              disabled={totalFilledSlots === 0}
              onClick={handleCommitBox}
              className={`mt-6 w-full py-3.5 px-5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                totalFilledSlots === 0
                  ? 'bg-[#E5E0D5] text-[#8C9289] cursor-not-allowed'
                  : 'bg-[#1F472B] hover:bg-[#16351F] text-[#FAF9F5] cursor-pointer'
              }`}
            >
              {addedNotification ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added Custom Crate to Harvest Bag</span>
                </>
              ) : (
                <span>
                  Add Custom Crate to Bag · ${finalCratePrice.toFixed(2)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
