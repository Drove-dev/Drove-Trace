export const EnvConfiguration = () => ({
  environment: process.env.NODE_ENV || 'development',
  port: +process.env.PORT! || 3000,

  database: {
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT! || 5432,
    name: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },

  jwtSecret: process.env.JWT_SECRET,
});
