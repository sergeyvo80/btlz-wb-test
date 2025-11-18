import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';

/**
 * Сервис для работы с Google Sheets API
 */
class GoogleSheetsService {
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;

  constructor(credentialsPath: string, spreadsheetId: string) {
    this.spreadsheetId = spreadsheetId;
    this.sheets = this.initializeSheets(credentialsPath);
  }

  /**
   * Инициализация Google Sheets API
   * @param credentialsPath 
   * @returns 
   */
  private initializeSheets(credentialsPath: string): sheets_v4.Sheets {
    const auth = new JWT({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // @ts-ignore
    return google.sheets({ version: 'v4', auth });
  }

  /**
   * Запись массива данных
   * @param data 
   * @param range 
   */
  async appendMultipleData(data: string[][], range: string = 'Sheet1'): Promise<void> {
    try {
      const sheetName = range.includes('!') ? range.split('!')[0] : range;
      const keysToReplace = new Set<string>();

      data.forEach((row) => {
        const key = row?.[0]?.toString().trim();
        if (key) {
          keysToReplace.add(key);
        }
      });

      if (keysToReplace.size > 0) {
        await this.deleteRowsByKeys(sheetName, keysToReplace);
      }

      await this.insertRowsAtTop(sheetName, data);
      console.log('Данные успешно добавлены в начало листа. Кол-во строк:', data.length);
    } catch (error) {
      console.error('Ошибка при записи данных:', error);
      throw error;
    }
  }

  /**
   * Обновление конкретного диапазона
   * @param data 
   * @param range 
   */
  async updateRange(data: any[][], range: string): Promise<void> {
    try {
      const request: sheets_v4.Params$Resource$Spreadsheets$Values$Update = {
        spreadsheetId: this.spreadsheetId,
        range: range,
        valueInputOption: 'RAW',
        requestBody: {
          values: data,
        },
      };

      const response = await this.sheets.spreadsheets.values.update(request);
      console.log('Диапазон успешно обновлен:', response.data.updatedRange);
    } catch (error) {
      console.error('Ошибка при обновлении диапазона:', error);
      throw error;
    }
  }

  /**
   * Создание нового листа
   * @param sheetName 
   * @param headers 
   */
  async createSheet(sheetName: string, headers: string[]): Promise<void> {
    try {
      // Создаем новый лист
      const addSheetRequest: sheets_v4.Params$Resource$Spreadsheets$Batchupdate = {
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetName
              }
            }
          }]
        }
      };

      await this.sheets.spreadsheets.batchUpdate(addSheetRequest);

      // Записываем заголовки
      // TODO: Добавить заголовки в зависимости от количества столбцов
      await this.updateRange([headers], `${sheetName}!A1:N1`);

      // // Записываем данные
      // await this.appendMultipleData(headers, sheetName);

      console.log(`Лист "${sheetName}"`);
    } catch (error) {
      console.error('Ошибка при создании листа:', error);
      throw error;
    }
  }

  /**
   * Удаляет строки на листе, у которых значение в первом столбце входит в набор ключей
   * @param sheetName 
   * @param keys 
   */
  private async deleteRowsByKeys(sheetName: string, keys: Set<string>): Promise<void> {
    try {
      const [sheetId, existingValuesResponse] = await Promise.all([
        this.getSheetId(sheetName),
        this.sheets.spreadsheets.values.get({
          spreadsheetId: this.spreadsheetId,
          range: sheetName,
        }),
      ]);

      if (sheetId === null) {
        console.warn(`Лист "${sheetName}" не найден. Удаление строк пропущено.`);
        return;
      }

      const existingValues = existingValuesResponse.data.values ?? [];
      const rowsToDelete: number[] = [];

      existingValues.forEach((row, index) => {
        const key = row?.[0]?.toString().trim();
        if (key && keys.has(key)) {
          rowsToDelete.push(index);
        }
      });

      if (rowsToDelete.length === 0) {
        return;
      }

      await this.deleteRows(sheetId, rowsToDelete);

      console.log(`Удалено строк: ${rowsToDelete.length}`);
    } catch (error) {
      console.error('Ошибка при удалении строк:', error);
      throw error;
    }
  }

  /**
   * Возвращает идентификатор листа по названию
   * @param sheetName 
   * @returns 
   */
  private async getSheetId(sheetName: string): Promise<number | null> {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
      ranges: [],
      includeGridData: false,
    });

    const targetSheet = response.data.sheets?.find(
      (sheet) => sheet.properties?.title === sheetName,
    );

    return targetSheet?.properties?.sheetId ?? null;
  }

  /**
   * Вставляет строки в начало листа, сдвигая существующие вниз
   * @param sheetName 
   * @param rows 
   */
  private async insertRowsAtTop(sheetName: string, rows: string[][]): Promise<void> {
    const sheetId = await this.getSheetId(sheetName);

    if (sheetId === null) {
      throw new Error(`Лист "${sheetName}" не найден`);
    }

    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: 1,
                endIndex: 1 + rows.length,
              },
              inheritFromBefore: false,
            },
          },
        ],
      },
    });

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A2`,
      valueInputOption: 'RAW',
      requestBody: {
        values: rows,
      },
    });
  }

  /**
   * Удаляет строки по индексам (индекс 0-based, включая заголовок)
   * @param sheetId 
   * @param rowsToDelete 
   */
  private async deleteRows(sheetId: number, rowsToDelete: number[]): Promise<void> {
    if (rowsToDelete.length === 0) {
      return;
    }

    const deleteRequests = rowsToDelete
      .sort((a, b) => b - a)
      .map((rowIndex) => ({
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex,
            endIndex: rowIndex + 1,
          },
        },
      }));

    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        requests: deleteRequests,
      },
    });
  }
}

export default GoogleSheetsService;
