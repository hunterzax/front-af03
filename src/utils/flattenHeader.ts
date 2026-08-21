export const flattenHeaders = (headerEntry: any) => {

  const flattenedHeaders: any = [];

  const processEntry = (label: any, entry: any, isMinMax = false) => {
    if (isMinMax) {
      flattenedHeaders.push({ label: `${label} Min`, key: entry.Min.key });
      flattenedHeaders.push({ label: `${label} Max`, key: entry.Max.key });
    } else {
      flattenedHeaders.push({ label, key: entry.key });
    }
  };

  // Add specific headers
  processEntry('Zone', headerEntry.Entry.Zone);
  processEntry('Area', headerEntry.Entry.Area);
  processEntry('Entry Meter ID', headerEntry.Entry['Entry Meter ID']);
  processEntry('Entry Point', headerEntry.Entry['Entry Point']);
  processEntry('New Connection?', headerEntry.Entry['New Connection?']);

  // Headers with Min/Max sub-headers
  const minMaxHeaders = [
    'Pressure Range',
    'Temperature Range',
    'GCV Range',
    'WI Range',
    'C2+',
    'CO2',
    'O2',
    'N2',
    'H2S',
    'Total S',
    'Hg',
    'H2O',
    'HC Dew Point',
  ];
  minMaxHeaders.forEach((header) => {
    processEntry(`${header} (PSig)`, headerEntry.Entry[header], true);
  });

  // Add Period From/To
  processEntry('Period From', headerEntry.Period.From);
  processEntry('Period To', headerEntry.Period.To);

  // Headers with date-specific sub-headers
  const dateHeaders = [
    'Capacity Daily Booking (MMBTU/d)',
    'Maximum Hour Booking (MMBTU/h)',
    'Capacity Daily Booking (MMscfd)',
    'Maximum Hour Booking (MMscfh)',
  ];
  dateHeaders.forEach((header) => {
    const entry = headerEntry[header];
    Object.keys(entry).forEach((key) => {
      if (key !== 'key') {
        flattenedHeaders.push({ label: `${header} ${key}`, key: entry[key].key });
      }
    });
  });

  return flattenedHeaders;
};
