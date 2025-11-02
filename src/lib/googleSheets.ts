// src/lib/googleSheets.ts
import { google } from 'googleapis'

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })

export async function appendToSheet(data: any[]) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Transactions!A:F',
      valueInputOption: 'RAW',
      requestBody: {
        values: [data],
      },
    })

    return response.data
  } catch (error) {
    console.error('Error writing to Google Sheets:', error)
    throw error
  }
}

export async function recordTransaction(transaction: {
  date: string
  productName: string
  variant: string
  quantity: number
  resellerId: string
  totalPrice: number
}) {
  const row = [
    transaction.date,
    transaction.productName,
    transaction.variant,
    transaction.quantity,
    transaction.resellerId,
    transaction.totalPrice,
  ]

  return await appendToSheet(row)
}
