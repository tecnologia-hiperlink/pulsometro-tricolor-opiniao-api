module.exports = {
  apps: [
    {
      name: 'tricolor-api',
      script: 'dist/presentation/main.js',
      cwd: '/var/www/html/pulsometrotricolor/pulsometro-tricolor-opiniao-api',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    },
    {
      name: 'tricolor-worker',
      script: 'dist/worker/worker.js',
      cwd: '/var/www/html/pulsometrotricolor/pulsometro-tricolor-opiniao-api',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/worker-error.log',
      out_file: './logs/worker-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
    },
  ],
};
