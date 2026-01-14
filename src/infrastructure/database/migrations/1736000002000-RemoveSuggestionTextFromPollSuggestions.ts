import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveSuggestionTextFromPollSuggestions1736000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remover coluna suggestion_text (agora temos question, option_a e option_b separados)
    await queryRunner.dropColumn('poll_suggestions', 'suggestion_text');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-adicionar coluna suggestion_text se precisar reverter
    await queryRunner.addColumn(
      'poll_suggestions',
      new TableColumn({
        name: 'suggestion_text',
        type: 'text',
        isNullable: false,
        default: "''",
      }),
    );
  }
}
