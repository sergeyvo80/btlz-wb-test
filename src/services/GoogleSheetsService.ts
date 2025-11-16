import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';
import * as path from 'path';

class GoogleSheetsService {
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;

  constructor(credentialsPath: string, spreadsheetId: string) {
    this.spreadsheetId = spreadsheetId;
    this.sheets = this.initializeSheets(credentialsPath);
  }

  private initializeSheets(credentialsPath: string): sheets_v4.Sheets {
    const auth = new JWT({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // @ts-ignore
    return google.sheets({ version: 'v4', auth });
  }


  // Запись массива данных
  async appendMultipleData(data: string[][], range: string = 'Sheet1'): Promise<void> {
    try {

      const request: sheets_v4.Params$Resource$Spreadsheets$Values$Append = {
        spreadsheetId: this.spreadsheetId,
        range: range,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: data,
        },
      };

      const response = await this.sheets.spreadsheets.values.append(request);
      console.log('Данные успешно добавлены. Обновлено ячеек:', response.data.updates?.updatedCells);
    } catch (error) {
      console.error('Ошибка при записи данных:', error);
      throw error;
    }
  }

  // Обновление конкретного диапазона
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

  // Создание нового листа
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
      await this.updateRange([headers], `${sheetName}!A1:M1`);

      // // Записываем данные
      // await this.appendMultipleData(headers, sheetName);

      console.log(`Лист "${sheetName}"`);
    } catch (error) {
      console.error('Ошибка при создании листа:', error);
      throw error;
    }
  }
}

export default GoogleSheetsService;