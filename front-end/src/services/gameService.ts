import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/v1/games';

// Función para obtener el token JWT, si este está almacenado en el localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Configuración por defecto para Axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para incluir el token en cada petición
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const createGame = async (gameData: {
  name: string;
  players: number;
  gameType: string;
  isPublic: boolean;
  allowSpectators: boolean;
  enableChat: boolean;
  recordStats: boolean;
}) => {
  try {
    const response = await axiosInstance.post('/create', gameData);
    return response.data;
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
};

export const getAllGames = async () => {
  try {
    const response = await axiosInstance.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
};

export const getGameById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching game with id ${id}:`, error);
    throw error;
  }
};

export const updateGameStatus = async (id: string, status: string) => {
  try {
    const response = await axiosInstance.put(`/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating game with id ${id}:`, error);
    throw error;
  }
};

export const deleteGame = async (id: string) => {
  try {
    await axiosInstance.delete(`/${id}`);
  } catch (error) {
    console.error(`Error deleting game with id ${id}:`, error);
    throw error;
  }
}; 