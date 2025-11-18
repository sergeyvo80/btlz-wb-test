import knex from "#postgres/knex.js";
import TariffsBox from "#types/TariffsBox.js";
import TariffsBoxResponse from "#types/TariffsBoxResponse.js";
import parseFloatFromString from "#utils/parseFloatFromString.js";
import dotenv from "dotenv";

dotenv.config();

const WB_TOKEN = process.env.WB_TOKEN;
if (!WB_TOKEN) {
  console.error("Ошибка: WB_TOKEN не установлен в переменных окружения");
  process.exit(1);
}

const WB_API_URL = process.env.WB_API_URL;
if (!WB_API_URL) {
  console.error("Ошибка: WB_API_URL не установлен в переменных окружения");
  process.exit(1);
}


async function fetchTariffsFromAPI(date: string) {
  try {
    const url = `${WB_API_URL}?date=${date}`;
    // const response = await fetch(url, {
    //   method: "GET",
    //   headers: {
    //     Authorization: WB_TOKEN as string,
    //   },
    // });

    // if (!response.ok) {
    //   throw new Error(
    //     `HTTP error! status: ${response.status}, statusText: ${response.statusText}`
    //   );
    // }

    // const data = await response.json();


const dataResponse: TariffsBoxResponse = {
  "response": {
    "data": {
      "dtNextBox": "",
      "dtTillMax": "2025-11-19",
      "warehouseList": [
        {
          "boxDeliveryBase": "46",
          "boxDeliveryCoefExpr": "100",
          "boxDeliveryLiter": "14",
          "boxDeliveryMarketplaceBase": "-",
          "boxDeliveryMarketplaceCoefExpr": "-",
          "boxDeliveryMarketplaceLiter": "-",
          "boxStorageBase": "0,07",
          "boxStorageCoefExpr": "100",
          "boxStorageLiter": "0,07",
          "geoName": "",
          "warehouseName": "Цифровой склад"
        },
        {
          "boxDeliveryBase": "89,7",
          "boxDeliveryCoefExpr": "195",
          "boxDeliveryLiter": "27,3",
          "boxDeliveryMarketplaceBase": "89,7",
          "boxDeliveryMarketplaceCoefExpr": "195",
          "boxDeliveryMarketplaceLiter": "27,3",
          "boxStorageBase": "0,1",
          "boxStorageCoefExpr": "145",
          "boxStorageLiter": "0,1",
          "geoName": "Центральный федеральный округ",
          "warehouseName": "Коледино"
        },
      ]
    }
  }
};

  const data: TariffsBox = dataResponse.response.data;

  // console.log('>>>>>', data);
    return data;
  } catch (error) {
    console.error("Ошибка при запросе к API:", error);
    throw error;
  }
}

async function importTariffs(date: string) {
  try {
    console.log(`Загрузка тарифов за дату: ${date}`);
    const tariffsData = await fetchTariffsFromAPI(date);

    if (!Array.isArray(tariffsData.warehouseList)) {
      console.error("Ошибка: API вернул не массив данных");
      return;
    }

    // Проверяем, что warehouseList существует и является массивом
    if (!tariffsData.warehouseList || !Array.isArray(tariffsData.warehouseList)) {
      console.error("Ошибка: поле warehouseList отсутствует или не является массивом");
      return;
    }

    if (tariffsData.warehouseList.length === 0) {
      console.log("Нет данных для импорта");
      return;
    }

console.log('>>>>>', date);

    // Очищаем старые данные за эту дату (опционально)
    await knex("tariffs-box").where("dtImport", date).delete();

    // Преобразуем данные из API в формат БД и вставляем
    const recordsToInsert = tariffsData.warehouseList.map((item: any) => ({
      dtImport: date ? new Date(date) : null,
      dtNextBox: tariffsData.dtNextBox ? new Date(tariffsData.dtNextBox) : null,
      dtTillMax: tariffsData.dtTillMax ? new Date(tariffsData.dtTillMax) : null,
      boxDeliveryBase: parseFloatFromString(item.boxDeliveryBase) ?? null,
      boxDeliveryCoefExpr: parseFloatFromString(item.boxDeliveryCoefExpr) ?? null,
      boxDeliveryLiter: parseFloatFromString(item.boxDeliveryLiter) ?? null,
      boxDeliveryMarketplaceBase: parseFloatFromString(item.boxDeliveryMarketplaceBase) ?? null,
      boxDeliveryMarketplaceCoefExpr: parseFloatFromString(item.boxDeliveryMarketplaceCoefExpr) ?? null,
      boxDeliveryMarketplaceLiter: parseFloatFromString(item.boxDeliveryMarketplaceLiter) ?? null,
      boxStorageBase: parseFloatFromString(item.boxStorageBase) ?? null,
      boxStorageCoefExpr: parseFloatFromString(item.boxStorageCoefExpr) ?? null,
      boxStorageLiter: parseFloatFromString(item.boxStorageLiter) ?? null,
      geoName: item.geoName ?? null,
      warehouseName: item.warehouseName ?? null,
    }));

    // console.log('>>>>>', recordsToInsert);
    await knex("tariffs-box").insert(recordsToInsert);

    console.log(`Успешно импортировано ${recordsToInsert.length} записей`);
  } catch (error) {
    console.error("Ошибка при импорте тарифов:", error);
    throw error;
  }
}

try {
  // Используем текущую дату в формате ГГГГ-ММ-ДД
  const today = new Date();
  const dateString = today.toISOString().split("T")[0];
  
  await importTariffs(dateString);
  console.log("Импорт завершён");
  await knex.destroy();
  process.exit(0);
} catch (error) {
  console.error("Импорт завершился с ошибкой:", error);
  await knex.destroy();
  process.exit(1);
}

