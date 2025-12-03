// src/scripts/utils/csv-helper.js

export const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(header => header.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',');
    
    // Membuat object { title: '...', level: '...', ... }
    const entry = headers.reduce((object, header, index) => {
      object[header] = values[index] ? values[index].trim() : '';
      return object;
    }, {});

    return entry;
  });
};