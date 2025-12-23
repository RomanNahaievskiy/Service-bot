import { sheetsApi } from "../../integrations/sheetsApi.js";

export const bookingsRepo = {
  create: (dto) => sheetsApi.createBooking(dto),
  setStatus: (id, status, admin) => sheetsApi.updateStatus(id, status, admin),
  cancel: (id) => sheetsApi.cancel(id),
};
