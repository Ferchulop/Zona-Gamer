import { GameStatus } from './types';

// Helper to format time elapsed
export const formatTimeElapsed = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Helper to get game status color
export const getStatusColor = (status: GameStatus): string => {
  switch (status) {
    case 'activo':
      return 'bg-green-500';
    case 'completado':
      return 'bg-blue-500';
    case 'cancelado':
      return 'bg-red-500';
    case 'pausado':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

// Datos de muestra para estadísticas (usados en GameStats.tsx)
export const playerActivityData = [
  { name: 'Monday', value: 42 },
  { name: 'Tuesday', value: 53 },
  { name: 'Wednesday', value: 57 },
  { name: 'Thursday', value: 69 },
  { name: 'Friday', value: 97 },
  { name: 'Saturday', value: 112 },
  { name: 'Sunday', value: 74 },
];

export const gameCompletionData = [
  { name: 'Completed', value: 35 },
  { name: 'Active', value: 45 },
  { name: 'Paused', value: 15 },
  { name: 'Canceled', value: 5 },
];

export const gameTypeDistribution = [
  { name: 'Adventure', value: 42 },
  { name: 'Strategy', value: 28 },
  { name: 'RPG', value: 36 },
  { name: 'Puzzle', value: 19 },
  { name: 'Action', value: 25 },
];
