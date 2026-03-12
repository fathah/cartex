import { env } from "next-runtime-env";

export const PUBLIC_ENV = {
  BASE_URL: env("NEXT_PUBLIC_URL"),
  ZAUTH_KEY: env("NEXT_PUBLIC_ZAUTH_KEY"),
  DRIVE_ROOT_URL: env("NEXT_PUBLIC_ZDRIVE_ROOT"),
};
