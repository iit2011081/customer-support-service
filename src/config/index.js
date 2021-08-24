import dotenv from 'dotenv'
dotenv.config();
const config = {
	port: process.env.PORT || 8081,
	userDetailsExpiry : process.env.USER_DETAILS_EXPIRY || 86400*60,
	DB: {
		username: process.env.POSTGRES_USER || 'root',
		password: process.env.POSTGRES_PASSWORD || 'password',
		database: process.env.DATABASE || 'customer_service',
		host: process.env.POSTGRES_HOST || 'localhost',
		port: process.env.POSTGRES_PORT || '5432',
		dialect: 'postgres',
	},
	redis: {
		host: process.env.REDIS_HOST || 'localhost',
		port: process.env.REDIS_PORT || '6379',
		password: process.env.REDIS_PASSWORD || ''
	}
};
export default config