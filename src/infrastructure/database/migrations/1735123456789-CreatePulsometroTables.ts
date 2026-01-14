import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePulsometroTables1735123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tabela polls
    await queryRunner.createTable(
      new Table({
        name: 'polls',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'title',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'option_a_label',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'option_b_label',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            isNullable: false,
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Tabela poll_results
    await queryRunner.createTable(
      new Table({
        name: 'poll_results',
        columns: [
          {
            name: 'poll_id',
            type: 'bigint',
            isPrimary: true,
          },
          {
            name: 'count_a',
            type: 'bigint',
            isNullable: false,
            default: 0,
          },
          {
            name: 'count_b',
            type: 'bigint',
            isNullable: false,
            default: 0,
          },
          {
            name: 'total',
            type: 'bigint',
            isNullable: false,
            default: 0,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Foreign key poll_results -> polls
    await queryRunner.createForeignKey(
      'poll_results',
      new TableForeignKey({
        columnNames: ['poll_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'polls',
        onDelete: 'CASCADE',
      }),
    );

    // Tabela votes
    await queryRunner.createTable(
      new Table({
        name: 'votes',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'poll_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'option_selected',
            type: 'char',
            length: '1',
            isNullable: false,
          },
          {
            name: 'email_fingerprint',
            type: 'bytea',
            isNullable: false,
          },
          {
            name: 'email_prefix2',
            type: 'char',
            length: '2',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Foreign key votes -> polls
    await queryRunner.createForeignKey(
      'votes',
      new TableForeignKey({
        columnNames: ['poll_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'polls',
        onDelete: 'CASCADE',
      }),
    );

    // Constraint CHECK para option_selected
    await queryRunner.query(
      `ALTER TABLE votes ADD CONSTRAINT chk_votes_option_selected CHECK (option_selected IN ('A', 'B'))`,
    );

    // Unique constraint para poll_id + email_fingerprint
    await queryRunner.createIndex(
      'votes',
      new TableIndex({
        name: 'uq_votes_poll_fingerprint',
        columnNames: ['poll_id', 'email_fingerprint'],
        isUnique: true,
      }),
    );

    // Índices para votes
    await queryRunner.createIndex(
      'votes',
      new TableIndex({
        name: 'idx_votes_poll_created_at_desc',
        columnNames: ['poll_id', 'created_at'],
        isUnique: false,
      }),
    );

    await queryRunner.createIndex(
      'votes',
      new TableIndex({
        name: 'idx_votes_poll_option',
        columnNames: ['poll_id', 'option_selected'],
        isUnique: false,
      }),
    );

    // Tabela contacts
    await queryRunner.createTable(
      new Table({
        name: 'contacts',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'email_normalized',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'email_global_fingerprint',
            type: 'bytea',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Unique constraints para contacts
    await queryRunner.createIndex(
      'contacts',
      new TableIndex({
        name: 'uq_contacts_email_norm',
        columnNames: ['email_normalized'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'contacts',
      new TableIndex({
        name: 'uq_contacts_fingerprint',
        columnNames: ['email_global_fingerprint'],
        isUnique: true,
      }),
    );

    // Índice para contacts
    await queryRunner.createIndex(
      'contacts',
      new TableIndex({
        name: 'idx_contacts_created_at_desc',
        columnNames: ['created_at'],
        isUnique: false,
      }),
    );

    // Tabela poll_suggestions
    await queryRunner.createTable(
      new Table({
        name: 'poll_suggestions',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'suggestion_text',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('poll_suggestions', true);
    await queryRunner.dropTable('contacts', true);
    await queryRunner.dropTable('votes', true);
    await queryRunner.dropTable('poll_results', true);
    await queryRunner.dropTable('polls', true);
  }
}
