import axios from 'axios';
import { GameStatus } from './types';

// Configuración base de la API
export const API_URL = 'http://localhost:8081';

// Crear una instancia de axios con configuración base
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función auxiliar para obtener el ID del usuario del almacenamiento local
const getUserIdFromStorage = () => {
  const userData = localStorage.getItem('userData');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user.id;
    } catch (error) {
      console.error('Error parsing user data from storage:', error);
    }
  }
  return '1'; // Valor por defecto para desarrollo
};

// Funciones específicas para operaciones de la API
export const gameService = {
  // Obtener todos los juegos
  getGames: async () => {
    const response = await apiClient.get('/v1/games');
    // Convertir fechas de string a Date en cada juego y asegurar que los campos de métricas existan
    return response.data.map(game => ({
      ...game,
      createdAt: game.createdAt ? new Date(game.createdAt) : new Date(),
      lastUpdated: game.lastUpdated ? new Date(game.lastUpdated) : new Date(),
      activeParticipants: game.activeParticipants || 0,
      averageTimePlayed: game.averageTimePlayed || 0
    }));
  },
  
  // Obtener un juego por su ID
  getGameById: async (id: string) => {
    const response = await apiClient.get(`/api/games/${id}`);
    return response.data;
  },
  
  // Crear un nuevo juego - CORREGIDO con la ruta exacta
  createGame: async (gameData: any) => {
    const response = await apiClient.post('/v1/games/create', gameData, {
      headers: {
        'userIdRequest': getUserIdFromStorage()
      }
    });
    return response.data;
  },
  
  // Actualizar un juego existente
  updateGame: async (id: string, gameData: any) => {
    const response = await apiClient.put(`/api/games/${id}`, gameData);
    return response.data;
  },
  
  // Cambiar el estado de un juego
  updateGameStatus: async (id: string, status: GameStatus) => {
    // Convertir el status a mayúsculas para que coincida con los nombres del enum
    const statusUpperCase = status.toUpperCase();
    
    const response = await apiClient.put(`/v1/games/${id}`, { 
      status: statusUpperCase  // Enviar en MAYÚSCULAS: 'ACTIVO', 'PAUSADO', etc.
    }, {
      headers: {
        'userIdRequest': getUserIdFromStorage(),
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },
  
  // Nuevos métodos para participación en juegos
  joinGame: async (gameId: string | number): Promise<any> => {
    const userId = getUserIdFromStorage();
    // Convertir gameId a número si es una cadena
    const numericGameId = typeof gameId === 'string' ? parseInt(gameId, 10) : gameId;
    console.log(`Intentando unirse al juego: userId=${userId}, gameId=${numericGameId}`);
    
    // Enviar el userId en el header como lo espera el backend
    const response = await apiClient.post(`/v1/game-participations/join/${numericGameId}`, 
      null,
      {
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': userId
        }
      }
    );
    return response.data;
  },
  
  leaveGame: async (gameId: string | number): Promise<any> => {
    const userId = getUserIdFromStorage();
    // Convertir gameId a número si es una cadena
    const numericGameId = typeof gameId === 'string' ? parseInt(gameId, 10) : gameId;
    console.log(`Intentando salir del juego: userId=${userId}, gameId=${numericGameId}`);
    
    // Enviar el userId en el header como lo espera el backend
    const response = await apiClient.post(`/v1/game-participations/leave/${numericGameId}`, 
      null,
      {
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': userId
        }
      }
    );
    return response.data;
  },
  
  isUserParticipating: async (gameId: string | number): Promise<boolean> => {
    const userId = getUserIdFromStorage();
    // Convertir gameId a número si es una cadena
    const numericGameId = typeof gameId === 'string' ? parseInt(gameId, 10) : gameId;
    console.log(`Verificando participación: userId=${userId}, gameId=${numericGameId}`);
    
    try {
      const response = await apiClient.get(`/v1/game-participations/status/${numericGameId}/${parseInt(userId, 10)}`);
      return response.data;
    } catch (error) {
      console.error('Error verificando participación:', error);
      return false;
    }
  },
  
  getGameParticipants: async (gameId: string | number): Promise<any[]> => {
    // Convertir gameId a número si es una cadena
    const numericGameId = typeof gameId === 'string' ? parseInt(gameId, 10) : gameId;
    console.log(`Obteniendo participantes del juego: gameId=${numericGameId}`);
    
    try {
      const response = await apiClient.get(`/v1/game-participations/game/${numericGameId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo participantes:', error);
      return [];
    }
  }
}; 