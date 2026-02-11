/**
 * Doğum tarihinden yaş hesapla
 */
export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Cinsiyet label'ı getir
 */
export const getGenderLabel = (gender?: string): string => {
  const labels: Record<string, string> = {
    male: 'Erkek',
    female: 'Kadın',
    other: 'Belirtilmemiş',
  };
  return labels[gender || 'other'] || 'Belirtilmemiş';
};
