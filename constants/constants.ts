import { PUBLIC_ENV } from "./env_public";

export const AppConstants = {
  SHOP_NAME: "Cartex Pro",
  get DRIVE_ROOT_URL() {
    return PUBLIC_ENV.DRIVE_ROOT_URL!;
  },
  get PUBLIC_URL() {
    return PUBLIC_ENV.BASE_URL!;
  },
};
