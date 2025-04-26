export type GameStatus = 'activo' | 'completado' | 'cancelado' | 'pausado'; // Estado del juego

export interface Game {
  id: number; // ID del juego
  name: string; // Nombre del juego
  status: GameStatus; // Estado del juego
  players: number; // Número de jugadores
  type?: string; // Tipo de juego
  timeElapsed?: number; // Tiempo transcurrido
  createdAt: Date; // Fecha de creación
  lastUpdated: Date; // Fecha de actualización
 
  
  userId?: number;
  gameType?: string;
  isPublic?: boolean;
  allowSpectators?: boolean;
  enableChat?: boolean;
  recordStats?: boolean;
  activeParticipants?: number;
  averageTimePlayed?: number;
}

export interface GameMetric {
  label: string;
  value: number;
  change: number;
  icon?: string;
}

export interface ChartData {
  name: string;
  value: number;
}
