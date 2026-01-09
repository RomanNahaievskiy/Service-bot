// curl -s -L "https://script.google.com/macros/s/AKfycbzd6UF2xD_DxbGkwbswCo14jcDMnn6TZNbpth2Y4Y7oxk_jwEXTRQrR955-kQpyZO15/exec?action=prices_get&token=Bs7iGITBwmhRfPhHxMst98w2bkIDw6OPLmkEdYIIY9tcd6mybjkm7LxZsFcf0fBl"

import { sheetsApi } from "./src/integrations/sheetsApi.js";
import { calcPricing } from "./src/core/services/pricing.service.js";

console.log(await sheetsApi.pricesGet());

console.log(
  await calcPricing({
    group: "passenger",
    vehicleId: "micro_18",
    optionIds: ["undercarriage", "engine_small"],
  })
);
