import GoogleSheetsService from "#services/GoogleSheetsService.js";
import * as path from "path";

const credentialsPath = path.join("credentials.json");

async function exportToTariffsBoxSpreadsheet(spreadsheetId: string, tariffsBoxArr: string[][]) {

  const sheetsService = new GoogleSheetsService(credentialsPath, spreadsheetId);

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

export default exportToTariffsBoxSpreadsheet;
