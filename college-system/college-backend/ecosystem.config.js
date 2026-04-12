module.exports = {
  apps: [
    {
      name: 'college-backend',
      script: 'dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: '/var/log/college/backend-error.log',
      out_file: '/var/log/college/backend-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Restart on memory growth beyond 512 MB (per instance)
      max_memory_restart: '512M',
    },
  ],
}
