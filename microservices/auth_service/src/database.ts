import { Logger } from 'winston';
import { Sequelize } from 'sequelize';
import { winstonLogger } from '@auth/logger';
import { config } from '@auth/config';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authDatabaseServer', 'debug');

export const sequelize: Sequelize = new Sequelize(config.DB_SOURCE, {
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    multipleStatements: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export async function databaseConnection(): Promise<void> {
  try {
    logger.info('Database connection called.....');
    await sequelize.authenticate();
    logger.info('AuthService MySQL Database Connection established successfully');
    await sequelize.close();
  } catch (e) {
    logger.error('Auth service- Unable to connect to database');
    logger.log('error', 'auth service databaseConnection method error', e);
  }
}

process.on('SIGINT', async () => {
  try {
    await sequelize.close();
    logger.info('AuthService MySQL Database Connection closed gracefully');
    process.exit(0);
  } catch (e) {
    logger.error('Error closing database connection', e);
    process.exit(1);
  }
});
