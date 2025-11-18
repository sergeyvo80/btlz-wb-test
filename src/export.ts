import knex from "#postgres/knex.js";
import GoogleSheetsService from "#services/GoogleSheetsService.js";
import * as path from "path";

const tariffsBox = await knex("tariffs-box").select();

const tariffsBoxArr: string[][] = [];

for (const item of tariffsBox) {
  console.log(Object.values(item));

  const dataArr = <string[]>Object.values(item);
  dataArr.shift();
  tariffsBoxArr.push(dataArr);
}

async function exportToSpreadsheet(spreadsheetId: string) {
  const credentialsPath = path.join("credentials.json");

  const sheetsService = new GoogleSheetsService(credentialsPath, spreadsheetId);

  const data: string[] = [];

  try {
    // Создание нового листа
    await sheetsService.createSheet('stocks_coefs', [
        "dtImport",
        "dtNextBox",
        "dtTillMax",
        "boxDeliveryBase",
        "boxDeliveryCoefExpr",
        "boxDeliveryLiter",
        "boxDeliveryMarketplaceBase",
        "boxDeliveryMarketplaceCoefExpr",
        "boxDeliveryMarketplaceLiter",
        "boxStorageBase",
        "boxStorageCoefExpr",
        "boxStorageLiter",
        "geoName",
        "warehouseName",
    ]);
  } catch (error) {
    // console.error('Произошла ошибка:', error);
  }

  try {
    // Запись нескольких строк
    await sheetsService.appendMultipleData(tariffsBoxArr, "stocks_coefs");

    console.log("Все операции выполнены успешно");
  } catch (error) {
    console.error("Произошла ошибка:", error);
    throw error;
  }
}



const spreadsheets = await knex("spreadsheets").select();


// spreadsheets.forEach(item => {
//   exportToSpreadsheet(item['spreadsheet_id']);
// })

try {
  const spreadsheets = await knex("spreadsheets").select();
  await Promise.all(
    spreadsheets.map((item) => exportToSpreadsheet(item["spreadsheet_id"]))
  );
  console.log("Экспорт завершён");
  await knex.destroy();
  process.exit(0);
} catch (error) {
  console.error("Экспорт завершился с ошибкой:", error);
  await knex.destroy();
  process.exit(1);
}
