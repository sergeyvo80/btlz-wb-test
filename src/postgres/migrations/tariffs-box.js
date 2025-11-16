/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    return knex.schema.createTable("tariffs-box", (table) => {
        table.increments("id");
        table.date("dtNextBox");
        table.date("dtTillMax");
        table.float("boxDeliveryBase");
        table.float("boxDeliveryCoefExpr");
        table.float("boxDeliveryLiter");
        table.float("boxDeliveryMarketplaceBase");
        table.float("boxDeliveryMarketplaceCoefExpr");
        table.float("boxDeliveryMarketplaceLiter");
        table.float("boxStorageBase");
        table.float("boxStorageCoefExpr");
        table.float("boxStorageLiter");
        table.string("geoName");
        table.string("warehouseName");
    });    
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    return knex.schema.dropTable("tariffs-box");
}
