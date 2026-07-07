import { BASE_PACKAGE_PRICE } from "@/lib/config";
import { addonOptions } from "@/lib/mock-data";
import type { AddonKey } from "@/types/domain";

export function calculatePackageTotal(purchasedAddons: AddonKey[] = []) {
  const addonsTotal = addonOptions
    .filter((addon) => purchasedAddons.includes(addon.key))
    .reduce((sum, addon) => sum + addon.price, 0);

  return BASE_PACKAGE_PRICE + addonsTotal;
}

export function getSelectedAddonLines(purchasedAddons: AddonKey[] = []) {
  return addonOptions.filter((addon) => purchasedAddons.includes(addon.key));
}
