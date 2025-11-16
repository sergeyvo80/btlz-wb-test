/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex) {
    await knex("spreadsheets")
        .insert([
            { spreadsheet_id: "17h9K_MOXFuYOWzrHOxatVCMKSIsJJFcsPGMZHsVMBLY" },
            { spreadsheet_id: "1dyqJk7UWtSxb8KnW60E_2E0euZYzUad1lpirrbTjPl8" }
        ])
        .onConflict(["spreadsheet_id"])
        .ignore();
}
