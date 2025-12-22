export const VEHICLES = [
  {
    id: "BUS",
    title: "Автобус",
    callback: "VEHICLE_BUS",
  },
  {
    id: "VAN",
    title: "Бус",
    callback: "VEHICLE_VAN",
  },
  {
    id: "TRUCK",
    title: "Тягач",
    callback: "VEHICLE_TRUCK",
  },
];

export function getVehicleByCallback(callback) {
  return VEHICLES.find((v) => v.callback === callback);
}
