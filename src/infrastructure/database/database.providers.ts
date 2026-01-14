import { initializeDataSource } from './data-source';

export const DATABASE = 'DATABASE';

export const databaseProviders = [
  {
    provide: DATABASE,
    useFactory: async () => {
      return await initializeDataSource();
    },
  },
];
