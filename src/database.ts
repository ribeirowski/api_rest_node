import { knex as setupKnex, Knex } from 'knex';
import { env } from './DTO/env';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in the environment variables');
}

export const config: Knex.Config = {
    client: 'sqlite',
    connection: {
        filename: env.DATABASE_URL,
    },
    useNullAsDefault: true,
    migrations: {
        extension: 'ts',
        directory: env.MIGRATION_URL,
    }
};

export const knex = setupKnex(config);