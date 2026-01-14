import 'reflect-metadata';
import { AppDataSource } from './data-source';

async function runMigrations() {
  try {
    console.log('Inicializando conexão com o banco de dados...');
    console.log('Config:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_DATABASE || 'spfc',
      username: process.env.DB_USERNAME || 'postgres',
    });
    
    await AppDataSource.initialize();
    console.log('Conexão estabelecida com sucesso!');

    console.log('Executando migrations...');
    const migrations = await AppDataSource.runMigrations();
    
    if (migrations.length === 0) {
      console.log('Nenhuma migration pendente.');
    } else {
      console.log(`✓ ${migrations.length} migration(s) executada(s) com sucesso:`);
      migrations.forEach((migration) => {
        console.log(`  - ${migration.name}`);
      });
    }

    await AppDataSource.destroy();
    console.log('Conexão fechada.');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar migrations:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

runMigrations();
