//do not remove this file, this is getting used in package.json scripts "typeorm"
import { DataSource } from 'typeorm';
import mysqlConfig from './database.config';
export const AppDataSource = new DataSource(mysqlConfig);
