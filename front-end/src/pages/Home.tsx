import React, { useState, useEffect } from 'react';
import PageTransition from '@/components/ui-custom/PageTransition';
import Card from '@/components/ui-custom/Card';
import StatCard from '@/components/ui-custom/StatCard';
import { Game } from '@/lib/types';
import { gameService } from '@/lib/api';
import { BarChart, BarChart2, Users, Clock, Gamepad, CheckCircle, RefreshCw, Activity } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';

/* Página de panel de seguimiento de juegos, muestra métricas y gráficos de los juegos activos */

// Cada color representa un estado específico: activo (verde), completado (azul), pausado (amarillo), cancelado (rojo)
const statusColors = {
  'Activo': '#22c55e',     // Verde
  'Completado': '#3b82f6', // Azul
  'Pausado': '#eab308',    // Amarillo
  'Cancelado': '#ef4444'   // Rojo
};

const Home = () => {
  // Estado para almacenar los juegos desde la API
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLiveUpdating, setIsLiveUpdating] = useState(false);
  
  // Estado para rastrear valores anteriores y calcular cambios
  const [prevMetrics, setPrevMetrics] = useState({
    activeGames: 0,
    totalPlayers: 0,
    completedGames: 0,
    avgTimePlayed: 0
  });

  // Función para obtener juegos de la API
  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const data = await gameService.getGames();
      
      // Guardar métricas actuales antes de actualizar
      const activeGamesCount = games.filter(game => game.status?.toLowerCase() === 'activo').length;
      const totalPlayersCount = games.reduce((acc, game) => acc + (game.activeParticipants || 0), 0);
      const completedGamesCount = games.filter(game => game.status?.toLowerCase() === 'completado').length;
      
      const gamesWithTimeTemp = games.filter(game => typeof game.averageTimePlayed === 'number' && game.averageTimePlayed > 0);
      const avgTimePlayedValue = gamesWithTimeTemp.length > 0 
        ? Math.floor(gamesWithTimeTemp.reduce((acc, game) => acc + (game.averageTimePlayed || 0), 0) / gamesWithTimeTemp.length)
        : 0;
      
      // Guardar valores previos
      setPrevMetrics({
        activeGames: activeGamesCount,
        totalPlayers: totalPlayersCount,
        completedGames: completedGamesCount,
        avgTimePlayed: avgTimePlayedValue
      });
      
      // Actualizar datos
      setGames(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchGames();
  }, []);

  // Actualización en tiempo real opcional
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLiveUpdating) {
      interval = setInterval(() => {
        fetchGames();
      }, 5000); // Actualizar cada 5 segundos los intervalos de tiempo
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveUpdating]);

  // Calcular métricas basadas en datos reales
  const activeGames = games.filter(game => game.status?.toLowerCase() === 'activo').length;
  const totalPlayers = games.reduce((acc, game) => acc + (game.activeParticipants || 0), 0);
  const completedGames = games.filter(game => game.status?.toLowerCase() === 'completado').length;
  
  // Corregir el cálculo de avgTimePlayed para evitar NaN
  const gamesWithTime = games.filter(game => typeof game.averageTimePlayed === 'number' && game.averageTimePlayed > 0);
  const avgTimePlayed = gamesWithTime.length > 0 
    ? Math.floor(gamesWithTime.reduce((acc, game) => acc + (game.averageTimePlayed || 0), 0) / gamesWithTime.length)
    : 0;
    
  // Calcular cambios porcentuales
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };
  
  // Solo mostrar cambios después de la primera carga y si hay actualizaciones
  const hasInitialData = prevMetrics.activeGames > 0 || prevMetrics.totalPlayers > 0;
  
  const activeGamesChange = hasInitialData ? calculateChange(activeGames, prevMetrics.activeGames) : 0;
  const totalPlayersChange = hasInitialData ? calculateChange(totalPlayers, prevMetrics.totalPlayers) : 0;
  const completedGamesChange = hasInitialData ? calculateChange(completedGames, prevMetrics.completedGames) : 0;
  const avgTimePlayedChange = hasInitialData ? calculateChange(avgTimePlayed, prevMetrics.avgTimePlayed) : 0;
  
  // Juegos populares ordenados por cantidad de jugadores activos
  const popularGames = [...games]
    .sort((a, b) => (b.activeParticipants || 0) - (a.activeParticipants || 0))
    .slice(0, 5);
  
  // Datos para el gráfico circular
  const pieData = [
    { name: 'Activo', value: activeGames },
    { name: 'Completado', value: completedGames },
    { name: 'Pausado', value: games.filter(game => game.status?.toLowerCase() === 'pausado').length },
    { name: 'Cancelado', value: games.filter(game => game.status?.toLowerCase() === 'cancelado').length }
  ];

  return (
    <PageTransition>
      <div className="page-container">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Panel de Seguimiento de Juegos</h1>
              <p className="text-muted-foreground mt-1">Bienvenido/a a tu panel de Seguimiento de Juegos</p>
            </div>
            
            {/* Botón de actualización y estado de actualización en vivo */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Última actualización: {lastUpdated.toLocaleTimeString()}</span>
              </div>
              
              <button 
                className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm"
                onClick={() => {
                  fetchGames();
                  setIsLiveUpdating(!isLiveUpdating);
                }}
              >
                {isLiveUpdating ? (
                  <>
                    <Activity size={16} className="animate-pulse" />
                    <span>Actualizaciones en vivo</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    <span>Recargar</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Métricas  usando datos reales y cambios porcentuales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              metric={{
                label: 'Juegos Activos',
                value: activeGames,
                change: activeGamesChange,
                icon: 'Gamepad'
              }}
            />
            <StatCard 
              metric={{
                label: 'Total Jugadores',
                value: totalPlayers,
                change: totalPlayersChange,
                icon: 'Users'
              }}
            />
            <StatCard 
              metric={{
                label: 'Juegos Completados',
                value: completedGames,
                change: completedGamesChange,
                icon: 'CheckCircle'
              }}
            />
            <StatCard 
              metric={{
                label: 'Promedio Tiempo Jugado',
                value: avgTimePlayed,
                change: avgTimePlayedChange,
                icon: 'Clock'
              }}
            />
          </div>
          
          {/* Secciones de resumen */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Distribución de estado de juegos */}
            <Card className="lg:col-span-1">
              <h3 className="text-lg font-medium mb-4">Estado de los Juegos</h3>
              <div className="h-[300px]">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        labelLine={true}
                        label={({ name, value, percent }) => `${percent ? (percent * 100).toFixed(0) : 0}%`}
                      >
                        {pieData.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={statusColors[entry.name]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                
                <div className="flex flex-wrap gap-4 justify-center mt-4">
                  {pieData.map((entry) => (
                    <div key={`legend-${entry.name}`} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: statusColors[entry.name] }}
                      ></div>
                      <span className="text-sm">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            
            {/* Juegos Populares*/}
            <Card className="lg:col-span-1">
              <h3 className="text-lg font-medium mb-4">Juegos Populares</h3>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {popularGames.length > 0 ? (
                    popularGames.map((game, index) => (
                      <div key={game.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                        <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-full">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{game.name}</p>
                          <p className="text-sm text-muted-foreground">{game.activeParticipants} jugadores</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          game.status?.toLowerCase() === 'activo' ? 'bg-green-100 text-green-800' : 
                          game.status?.toLowerCase() === 'completado' ? 'bg-blue-100 text-blue-800' :
                          game.status?.toLowerCase() === 'pausado' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {game.status?.toLowerCase()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-10">No hay juegos disponibles</p>
                  )}
                </div>
              )}
            </Card>
            
            {/* Actividad Reciente */}
            <Card className="lg:col-span-1">
              <h3 className="text-lg font-medium mb-4">Actividad Reciente</h3>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {games.length > 0 ? (
                    games
                      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                      .slice(0, 5)
                      .map((game, index) => (
                        <div key={game.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index % 2 === 0 ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                            {index % 2 === 0 ? <Gamepad size={20} /> : <Users size={20} />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{game.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Actualizado: {new Date(game.lastUpdated).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            game.status?.toLowerCase() === 'activo' ? 'bg-green-100 text-green-800' : 
                            game.status?.toLowerCase() === 'completado' ? 'bg-blue-100 text-blue-800' :
                            game.status?.toLowerCase() === 'pausado' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {game.status?.toLowerCase()}
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-center text-muted-foreground py-10">No hay actividad reciente</p>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Home;
