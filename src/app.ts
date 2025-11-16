import knex, { migrate, seed } from "#postgres/knex.js";

await migrate.latest();
await seed.run();

console.log("All migrations and seeds have been run");

// TODO: регулярное получение информации о тарифах wb и сохранение их в БД на каждый день;
// TODO: регулярное обновление информации о актуальных тарифах в google-таблицах.
