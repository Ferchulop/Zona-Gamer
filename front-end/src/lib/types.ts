export type GameStatus = 'activo' | 'completado' | 'cancelado' | 'pausado';

export interface Game {
  id: number;
  name: string;
  status: GameStatus;
  players: number;
  type?: string;
  timeElapsed?: number;
  createdAt: Date;
  lastUpdated: Date;
 
  
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
