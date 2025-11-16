/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex) {
    await knex("tariffs-box")
        .insert([{
            "dtNextBox": "2024-02-01",
            "dtTillMax": "2024-03-31",
            "boxDeliveryBase": 48,
            "boxDeliveryCoefExpr": 160,
            "boxDeliveryLiter": 11.2,
            "boxDeliveryMarketplaceBase": 40,
            "boxDeliveryMarketplaceCoefExpr": 125,
            "boxDeliveryMarketplaceLiter": 11,
            "boxStorageBase": 0.14,
            "boxStorageCoefExpr": 115,
            "boxStorageLiter": 0.07,
            "geoName": "Центральный федеральный округ",
            "warehouseName": "Коледино"
        }])
}
