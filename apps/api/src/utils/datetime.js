function useHour12(timeFormat) {
  return timeFormat === '12h';
}

function formatTime(dateInput, { locale = 'es-AR', timeZone = 'America/Argentina/Buenos_Aires', timeFormat = '24h' } = {}) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toLocaleTimeString(locale, {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: useHour12(timeFormat),
  });
}

module.exports = { useHour12, formatTime };
