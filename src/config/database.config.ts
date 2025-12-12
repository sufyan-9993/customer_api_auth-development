// import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
// import { CosmosClient } from '@azure/cosmos';
import { config } from 'dotenv';

// Load environment variables from the correct .env file
// Example: .env.development, .env.production, .env.staging, etc.
// This ensures TypeORM CLI has access to DB credentials outside of NestJS
config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const mysqlConfig: DataSourceOptions = {
  type: 'mysql',
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '13102001',
  database: process.env.MYSQL_DATABASE || 'gg',
  entities: [__dirname + '/../modules/**/entities/**/*.entity{.ts,.js}'],

  // We are using migrations, synchronize should be set to false.
  synchronize: false,

  // Run migrations automatically,
  // We can disable this if you prefer running migration manually.
  // Run migration using "npm run migration:run" in the PROD environment
  // migrationsRun: process.env.NODE_ENV !== 'production',

  // Allow both start:prod and start:dev to use migrations
  // __dirname is either dist or src folder, meaning either
  // the compiled js in prod or the ts in dev.
  migrations: [__dirname + '/../modules/database/migrations/**/*{.ts,.js}'],
};

// export const cosmosConfig = () => ({
//   endpoint: process.env.COSMOS_ENDPOINT,
//   key: process.env.COSMOS_KEY,
//   databaseId: process.env.COSMOS_DATABASE,
// });

// async function initializeCosmosClient() {
//   const config = cosmosConfig();
//   const client = new CosmosClient({
//     endpoint: config.endpoint,
//     key: config.key,
//     connectionPolicy: {
//       enableEndpointDiscovery: true,
//     },
//   });

//   // Ensure database exists
//   const { database } = await client.databases.createIfNotExists({
//     id: config.databaseId,
//   });

//   return {
//     client,
//     database,
//   };
// }

export default mysqlConfig;
