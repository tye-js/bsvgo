module.exports = {
  apps: [
    {
      name: "bsvgo",
      script: "npm",
      args: "start",
      instances: "max",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
