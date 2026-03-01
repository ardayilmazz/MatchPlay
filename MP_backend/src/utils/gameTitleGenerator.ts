/**
 * Oyun için otomatik başlık oluşturur
 * Frontend'deki generateGameTitle ile aynı mantık
 */

const TURKISH_MONTHS = [
  'ocakta', 'şubatta', 'martta', 'nisanda', 'mayısta', 'haziranda',
  'temmuzda', 'ağustosta', 'eylülde', 'ekimde', 'kasımda', 'aralıkta'
];

function getTimeOfDay(hour: number): string {
  if (hour >= 6 && hour <= 12) {
    return 'sabah';
  } else if (hour > 12 && hour <= 18) {
    return 'öğleden sonra';
  } else {
    return 'akşam';
  }
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

export function generateGameTitle(
  gameName: string,
  districtName: string,
  startDate: Date
): string {
  const hour = startDate.getHours();
  const timeOfDay = getTimeOfDay(hour);
  
  if (isToday(startDate)) {
    return `bu ${timeOfDay} ${districtName}'de ${gameName} oynuyoruz`;
  } else if (isTomorrow(startDate)) {
    return `yarın ${timeOfDay} ${districtName}'de ${gameName} oynuyoruz`;
  } else {
    const day = startDate.getDate();
    const monthName = TURKISH_MONTHS[startDate.getMonth()];
    return `${day} ${monthName} ${districtName}'de ${gameName} oynuyoruz`;
  }
}
