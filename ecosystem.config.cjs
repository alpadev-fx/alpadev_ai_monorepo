module.exports = {
  apps: [
    {
      name: 'alpadev-monorepo',
      cwd: '/home/alpadev/alpadev/apps/frontend',
      script: 'pnpm',
      args: 'start:prod',
      interpreter: 'none',
      env_file: '/home/alpadev/alpadev/.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        TURBO_CACHE_DIR: '/home/alpadev/.turbo-cache',
        TURBO_LOGS_DIR: '/home/alpadev/.turbo-logs',
        TURBO_TELEMETRY_DISABLED: '1',
      },
      error_file: '/home/alpadev/logs/alpadev-error.log',
      out_file: '/home/alpadev/logs/alpadev-out.log',
      merge_logs: true,
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    }
  ]
}
