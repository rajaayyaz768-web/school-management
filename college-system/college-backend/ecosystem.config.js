module.exports = {
  apps: [
    {
      name: 'college-backend',
      script: 'dist/src/server.js',   // tsc rootDir=. → outDir=dist → entry at dist/src/server.js
      instances: 'max',               // one worker per CPU core
      exec_mode: 'cluster',
      watch: false,
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      // Log to /var/log/college/ — create dir before first start:
      //   sudo mkdir -p /var/log/college && sudo chown deploy:deploy /var/log/college
      error_file: '/var/log/college/backend-error.log',
      out_file: '/var/log/college/backend-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '512M',
      // Zero-downtime reload: pm2 reload college-backend --update-env
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
}
