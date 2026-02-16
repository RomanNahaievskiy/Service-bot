import { sheetsApi } from "./src/integrations/sheetsApi.js";

const r = await sheetsApi.createBooking({
  tgId: "999",
  fullName: "Bot Integration Test",
  service: "wash",
  startsAt: "2025-12-24T12:00:00+02:00",
  endsAt: "2025-12-24T12:30:00+02:00",
  phone: "+380000000000",
  vehicle: "Bus",
  comment: "from bot code",
});
console.log(r);

("contract_pricing_get",
  {
    contractNo: "KLR-00123",
    vehicleId: "bus_doubus_double",
    serviceId: "contract_wash",
    optionIds: ["undercarriage"],
  });
