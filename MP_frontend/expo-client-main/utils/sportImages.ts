import { ImageSourcePropType } from 'react-native';

/**
 * Bilinen spor görselleri (assets içinde dosya olanlar).
 * Eşleşme yoksa null — örn. oyun detayında görsel gösterilmez.
 */
export function resolveSportImageOrNull(sportName: string): ImageSourcePropType | null {
  const n = sportName.toLowerCase();
  if (n.includes('satranç') || n.includes('chess')) {
    return require('@/assets/images/chess.png');
  }
  if (n.includes('futbol') || n.includes('halı') || n.includes('saha') || n.includes('football')) {
    return require('@/assets/images/football.png');
  }
  if (n.includes('basket') || n.includes('basketbol')) {
    return require('@/assets/images/basketball.png');
  }
  if (n.includes('voleybol') || n.includes('volley')) {
    return require('@/assets/images/volleyball.png');
  }
  if (n.includes('masa tenis') || n.includes('table tennis') || n.includes('ping pong') || n.includes('ping')) {
    return require('@/assets/images/table tennis.png');
  }
  if (n.includes('tenis')) {
    return require('@/assets/images/tennis.png');
  }
  if (n.includes('bilardo') || n.includes('pool') || n.includes('bilyardo')) {
    return require('@/assets/images/billards.png');
  }
  if (n.includes('dart')) {
    return require('@/assets/images/dart.png');
  }
  if (n.includes('jenga')) {
    return require('@/assets/images/jenga.png');
  }
  if (n.includes('bowling')) {
    return require('@/assets/images/bowling.png');
  }
  if (n.includes('monopol') || n.includes('monopoly')) {
    return require('@/assets/images/monoploy.png');
  }
  if (n.includes('pişti') || n.includes('card') || n.includes('iskambil') || n.includes('kart')) {
    return require('@/assets/images/card games.png');
  }
  if (n.includes('uno')) {
    return require('@/assets/images/uno.png');
  }
  if (n.includes('tavla') || n.includes('backgammon')) {
    return require('@/assets/images/backgammon.png');
  }
  if (n.includes('scrabble') || n.includes('scrablle')) {
    return require('@/assets/images/scrablle.png');
  }
  return null;
}

/** Liste kartları için: bilinen spor görseli veya varsayılan futbol */
export function resolveSportImage(sportName: string): ImageSourcePropType {
  return resolveSportImageOrNull(sportName) ?? require('@/assets/images/football.png');
}
