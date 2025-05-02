import React, { useState, useEffect } from 'react';
import PageTransition from '@/components/ui-custom/PageTransition';
import Card from '@/components/ui-custom/Card';
import { Game } from '@/lib/types';
import { gameService } from '@/lib/api';
import { 
  BarChart, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, 
  Bar, Line, PieChart, Pie, Cell, Scatter, ScatterChart, CartesianGrid
} from 'recharts';

/* Página de estadísticas del juego, muestra gráficos y métricas de participación y engagement */

// Colores para gráficos
const COLORS = ['#3182ce', '#63b3ed', '#90cdf4', '#4299e1', '#22c55e', '#ef4444', '#eab308'];
const STATUS_COLORS = {
  'activo': '#22c55e',      // Verde
  'completado': '#3b82f6',  // Azul
  'pausado': '#eab308',     // Amarillo
  'cancelado': '#ef4444'    // Rojo
};

const GameStats = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [participationTrend, setParticipationTrend] = useState<any[]>([]);
  
  // Cargar datos al montar el componente
  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        const data = await gameService.getGames();
        setGames(data);
        // Simulamos datos históricos de participación (en una aplicación real, esto vendría de la API)
        generateParticipationTrend(data);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGames();
  }, []);
  
  // Función para generar datos de tendencia (simulados para esta demostración)
  const generateParticipationTrend = (gamesData: Game[]) => {
    const trend = [];
    const now = new Date();
    const currentDay = now.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
    
    // Ajustar para empezar desde el lunes más reciente
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(now);
    monday.setDate(monday.getDate() - daysToMonday);
    
    // Generar datos para 7 días empezando desde el lunes
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(date.getDate() + i);
      
      // Obtener nombre del día en español y capitalizar primera letra
      const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' })
        .replace(/^\w/, c => c.toUpperCase());
      
      // Variación aleatoria del -20% al +20% desde los datos actuales
      const variation = 0.8 + (Math.random() * 0.4); // Entre 0.8 y 1.2
      const activeUsers = Math.round(gamesData.reduce((acc, game) => acc + (game.activeParticipants || 0), 0) * variation);
      
      trend.push({
        name: dayName,
        value: activeUsers
      });
    }
    
    setParticipationTrend(trend);
  };
  
  // Calcular datos para gráficos basados en datos reales
  
  // 1. Distribución de estados de juego
  const statusDistribution = [
    { name: 'Activo', value: games.filter(game => game.status?.toLowerCase() === 'activo').length },
    { name: 'Completado', value: games.filter(game => game.status?.toLowerCase() === 'completado').length },
    { name: 'Pausado', value: games.filter(game => game.status?.toLowerCase() === 'pausado').length },
    { name: 'Cancelado', value: games.filter(game => game.status?.toLowerCase() === 'cancelado').length }
  ];
  
  // 2. Distribución por tipo de juego
  const getGameTypeDistribution = () => {
    // Mapa de traducciones de inglés a español
    const tiposTraducciones: Record<string, string> = {
      'Strategy': 'Estrategia',
      'Adventure': 'Aventura',
      'Action': 'Acción',
      'Accion': 'Acción'  // Agregar variante sin tilde
    };

    const typeCounts = games.reduce((acc, game) => {
      if (!game.gameType) {
        acc['Desconocido'] = (acc['Desconocido'] || 0) + 1;
        return acc;
      }

      // Normalizar el tipo: primera letra mayúscula, resto minúsculas
      const normalizedType = game.gameType.charAt(0).toUpperCase() + game.gameType.slice(1).toLowerCase();
      
      // Normalizar 'Accion' a 'Acción' explícitamente
      if (normalizedType === 'Accion') {
        acc['Acción'] = (acc['Acción'] || 0) + 1;
        return acc;
      }
      
      // Usar la traducción si existe, si no usar el tipo normalizado
      const translatedType = tiposTraducciones[normalizedType] || normalizedType;
      
      acc[translatedType] = (acc[translatedType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  };
  
  // 3. Relación entre jugadores activos y tiempo promedio de juego
  const gameEngagementData = games.map(game => ({
    name: game.name,
    jugadores: game.activeParticipants || 0,
    tiempoPromedio: game.averageTimePlayed || 0,
    estado: game.status?.toLowerCase() || 'desconocido'
  }));
  
  // 4. Métricas de engagement
  const avgTimePlayed = games.length > 0 
    ? Math.round(games.reduce((sum, game) => sum + (game.averageTimePlayed || 0), 0) / games.length) 
    : 0;
    
  const completionRate = statusDistribution[1].value > 0 && games.length > 0
    ? Math.round((statusDistribution[1].value / games.length) * 100)
    : 0;

  // Calcular tasa de retención (jugadores que siguen activos)
  const calculateRetentionRate = () => {
    // Obtener el total de juegos que tienen al menos un participante (activo o no)
    const gamesWithParticipants = games.filter(game => 
      (game.activeParticipants || 0) > 0 || game.status?.toLowerCase() === 'completado'
    );

    if (gamesWithParticipants.length === 0) return 0;

    // Calcular el porcentaje de juegos con participantes activos
    const gamesWithActivePlayers = games.filter(game => 
      (game.activeParticipants || 0) > 0 && game.status?.toLowerCase() === 'activo'
    );

    return Math.round((gamesWithActivePlayers.length / gamesWithParticipants.length) * 100);
  };

  // Calcular tasa de nuevos jugadores (última semana)
  const calculateNewPlayersRate = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Contar jugadores activos totales y nuevos
    const totalActivePlayers = games.reduce((sum, game) => sum + (game.activeParticipants || 0), 0);
    
    // Contar jugadores que se unieron en la última semana
    const newPlayers = games.reduce((sum, game) => {
      // Si el juego se creó en la última semana, contar sus participantes activos
      if (new Date(game.createdAt) >= oneWeekAgo) {
        return sum + (game.activeParticipants || 0);
      }
      return sum;
    }, 0);

    // Calcular el porcentaje
    return totalActivePlayers > 0 
      ? Math.round((newPlayers / totalActivePlayers) * 100)
      : 0;
  };
    
  const retentionRate = calculateRetentionRate();
  const acquisitionRate = calculateNewPlayersRate();
  
  return (
    <PageTransition>
      <div className="page-container">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estadísticas del Juego</h1>
            <p className="text-muted-foreground mt-1">Analiza el rendimiento y las métricas de tu juego con datos reales</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-[500px]">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Player Activity Trend */}
                <Card>
                  <h3 className="text-lg font-medium mb-4">Tendencia de Actividad de Jugadores</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={participationTrend}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3182ce" 
                          strokeWidth={2} 
                          activeDot={{ r: 8 }} 
                          name="Jugadores Activos" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                
                {/* Game Status Distribution */}
                <Card>
                  <h3 className="text-lg font-medium mb-4">Distribución por Estado</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name.toLowerCase()] || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} juegos`, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                
                {/* Game Type Distribution */}
                <Card>
                  <h3 className="text-lg font-medium mb-4">Distribución por Tipo de Juego</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getGameTypeDistribution()}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Cantidad de Juegos" fill="#3182ce" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                
                {/* Game Engagement Scatter Plot - NUEVO */}
                <Card>
                  <h3 className="text-lg font-medium mb-4">Engagement por Juego</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart
                        margin={{
                          top: 20,
                          right: 20,
                          bottom: 20,
                          left: 20,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="number" 
                          dataKey="jugadores" 
                          name="Jugadores Activos"
                          domain={[0, 1000]}
                          ticks={[0, 2, 4, 6, 8, 10, 20, 30, 40, 50, 100, 200, 300, 400, 500, 1000]}
                          tickFormatter={(value) => {
                            if (value >= 1000) return '1000+';
                            return value.toString();
                          }}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="tiempoPromedio" 
                          name="Tiempo Promedio (min)"
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          formatter={(value, name) => {
                            if (name === 'jugadores') return [`${value} jugadores`, 'Jugadores Activos'];
                            if (name === 'tiempoPromedio') return [`${value} minutos`, 'Tiempo Promedio'];
                            return [value, name];
                          }}
                        />
                        <Scatter 
                          name="Juegos" 
                          data={gameEngagementData} 
                          fill="#8884d8"
                        >
                          {gameEngagementData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={STATUS_COLORS[entry.estado] || '#8884d8'} 
                            />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                
                {/* Engagement Metrics */}
                <Card className="lg:col-span-2">
                  <h3 className="text-lg font-medium mb-4">Métricas de Engagement</h3>
                  <div className="space-y-6 py-2">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Tiempo Promedio de Juego</span>
                        <span className="text-sm font-medium">{avgTimePlayed} min</span>
                      </div>
                      <div className="h-2 bg-muted rounded overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, avgTimePlayed / 2)}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Tasa de Retención de Jugadores</span>
                        <span className="text-sm font-medium">{retentionRate}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded overflow-hidden">
                        <div className="bg-green-500 h-full" style={{ width: `${retentionRate}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Tasa de Finalización de Juegos</span>
                        <span className="text-sm font-medium">{completionRate}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded overflow-hidden">
                        <div className="bg-yellow-500 h-full" style={{ width: `${completionRate}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Adquisición de Nuevos Jugadores</span>
                        <span className="text-sm font-medium">{acquisitionRate}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded overflow-hidden">
                        <div className="bg-purple-500 h-full" style={{ width: `${acquisitionRate}%` }}></div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default GameStats;
