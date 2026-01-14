import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddQuestionOptionsToPollSuggestions1736000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar coluna question
    await queryRunner.addColumn(
      'poll_suggestions',
      new TableColumn({
        name: 'question',
        type: 'text',
        isNullable: true,
      }),
    );

    // Adicionar coluna option_a
    await queryRunner.addColumn(
      'poll_suggestions',
      new TableColumn({
        name: 'option_a',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // Adicionar coluna option_b
    await queryRunner.addColumn(
      'poll_suggestions',
      new TableColumn({
        name: 'option_b',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('poll_suggestions', 'option_b');
    await queryRunner.dropColumn('poll_suggestions', 'option_a');
    await queryRunner.dropColumn('poll_suggestions', 'question');
  }
}
