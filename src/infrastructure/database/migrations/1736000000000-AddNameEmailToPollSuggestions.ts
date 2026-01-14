import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNameEmailToPollSuggestions1736000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar coluna name (nullable primeiro para permitir atualização)
    await queryRunner.addColumn(
      'poll_suggestions',
      new TableColumn({
        name: 'name',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // Adicionar coluna email (nullable primeiro para permitir atualização)
    await queryRunner.addColumn(
      'poll_suggestions',
      new TableColumn({
        name: 'email',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // Atualizar registros existentes (se houver) com valores padrão
    await queryRunner.query(`
      UPDATE poll_suggestions 
      SET name = 'Usuário Anônimo', 
          email = 'anonimo@exemplo.com'
      WHERE name IS NULL OR email IS NULL;
    `);

    // Tornar as colunas NOT NULL após atualizar os dados
    await queryRunner.query(`
      ALTER TABLE poll_suggestions 
      ALTER COLUMN name SET NOT NULL,
      ALTER COLUMN email SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('poll_suggestions', 'email');
    await queryRunner.dropColumn('poll_suggestions', 'name');
  }
}
