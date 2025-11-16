import knex from "#postgres/knex.js";
import GoogleSheetsService from "#services/GoogleSheetsService.js"
import * as path from 'path';



// TODO: регулярное получение информации о тарифах wb и сохранение их в БД на каждый день;
// TODO: регулярное обновление информации о актуальных тарифах в google-таблицах.

const tariffsBox = await knex("tariffs-box").select();

const tariffsBoxArr: string[][] = [];

for (let item of tariffsBox) {
  console.log(Object.values(item))

  const dataArr = <string[]>Object.values(item);
  dataArr.shift();
  tariffsBoxArr.push(dataArr);
}

console.log('>>>', tariffsBoxArr)

// Пример использования
async function main() {
  const credentialsPath = path.join('credentials.json');

  // TODO: knex("spreadsheets")
  const spreadsheetId = '17h9K_MOXFuYOWzrHOxatVCMKSIsJJFcsPGMZHsVMBLY'; // ID вашей таблицы

  const sheetsService = new GoogleSheetsService(credentialsPath, spreadsheetId);
  
  const data: string[] = [];
  
  
  try {
    // Создание нового листа
    await sheetsService.createSheet('stocks_coefs', [
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
    console.error('Произошла ошибка:', error);
  }


  try {
    // Запись нескольких строк
    await sheetsService.appendMultipleData(tariffsBoxArr, "stocks_coefs");

    console.log('Все операции выполнены успешно');
  } catch (error) {
    console.error('Произошла ошибка:', error);
  }
}


main();