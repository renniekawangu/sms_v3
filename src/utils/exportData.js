/**
 * Data Export Utilities
 * Exports data to CSV, Excel, PDF, and JSON formats
 */

export const exportToCSV = (data, filename = 'export.csv', headers = null) => {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  const keys = headers || Object.keys(data[0])
  const csvContent = [
    keys.join(','),
    ...data.map(row =>
      keys.map(key => {
        const value = row[key]
        if (value === null || value === undefined) return ''
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`
        }
        if (typeof value === 'object') return JSON.stringify(value)
        return value
      }).join(',')
    )
  ].join('\n')

  downloadFile(csvContent, filename, 'text/csv')
}

export const exportToJSON = (data, filename = 'export.json') => {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, filename, 'application/json')
}

export const exportToExcel = (data, filename = 'export.xlsx') => {
  // For Excel, we'll use CSV format as it opens in Excel
  // For advanced Excel features, you'd need a library like xlsx
  exportToCSV(data, filename.replace('.xlsx', '.csv'))
}

export const exportToPDF = (data, filename = 'export.pdf', title = 'Report') => {
  // Basic PDF export using print functionality
  // For advanced PDF generation, use jsPDF library
  const printWindow = window.open('', '', 'height=600,width=800')
  const html = generateHTMLTable(data, title)
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.print()
  setTimeout(() => printWindow.close(), 250)
}

export const downloadFile = (content, filename, mimeType) => {
  const element = document.createElement('a')
  element.setAttribute('href', `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`)
  element.setAttribute('download', filename)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

export const generateHTMLTable = (data, title = 'Report') => {
  if (!data || data.length === 0) return `<h2>${title}</h2><p>No data</p>`

  const keys = Object.keys(data[0])
  const rows = data.map(row =>
    `<tr>${keys.map(key => `<td>${row[key] || '-'}</td>`).join('')}</tr>`
  ).join('')

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          h2 { color: #333; }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        <table>
          <thead><tr>${keys.map(key => `<th>${key}</th>`).join('')}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `
}

export const getExportFilename = (prefix, extension = 'csv') => {
  const date = new Date().toISOString().split('T')[0]
  return `${prefix}_${date}.${extension}`
}
