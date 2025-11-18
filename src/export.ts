import knex from "#postgres/knex.js";
import exportToTariffsBoxSpreadsheet from "#services/exportToTariffsBoxSpreadsheet.js";

try {
  // Берем данные из БД
  const tariffsBox = await knex("tariffs-box").select();
  const tariffsBoxArr: string[][] = [];

  for (const item of tariffsBox) {
    console.log(Object.values(item));

    const dataArr = <string[]>Object.values(item);
    dataArr.shift();
    tariffsBoxArr.push(dataArr);
  }

  const spreadsheets = await knex("spreadsheets").select();
  await Promise.all(
    spreadsheets.map((item) => exportToTariffsBoxSpreadsheet(item["spreadsheet_id"], tariffsBoxArr))
  );
  console.log("Экспорт завершён");
  await knex.destroy();
  process.exit(0);
} catch (error) {
  console.error("Экспорт завершился с ошибкой:", error);
  await knex.destroy();
  process.exit(1);
}
