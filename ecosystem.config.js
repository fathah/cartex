module.exports = {
  apps: [
    {
      name: 'blueoud-cartex',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
        ZDRIVE_KEY: process.env.ZDRIVE_KEY,
        ZDRIVE_SECRET: process.env.ZDRIVE_SECRET,
        NEXT_PUBLIC_ZAUTH_KEY: process.env.NEXT_PUBLIC_ZAUTH_KEY,
        NEXT_PUBLIC_ZDRIVE_ROOT: process.env.NEXT_PUBLIC_ZDRIVE_ROOT,
        PORT: 3137
      },
    },
  ],
};
