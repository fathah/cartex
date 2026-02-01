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
        PORT: 3137
      },
    },
  ],
};
