import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary().notNullable()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.dateTime('datetime').notNullable()
    table.boolean('diet').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table
      .uuid('userId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
