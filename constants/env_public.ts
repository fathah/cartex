import { env } from "next-runtime-env";

export const PUBLIC_ENV = {
  get BASE_URL() {
    return env("NEXT_PUBLIC_URL");
  },
  get ZAUTH_KEY() {
    return env("NEXT_PUBLIC_ZAUTH_KEY");
  },
  get DRIVE_ROOT_URL() {
    return env("NEXT_PUBLIC_ZDRIVE_ROOT");
  },
};
