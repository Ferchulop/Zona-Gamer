import React, { useState, useEffect } from 'react';
import PageTransition from '@/components/ui-custom/PageTransition';
import GameCard from '@/components/ui-custom/GameCard';
import { Game, GameStatus } from '@/lib/types';
import { Search, Filter, RefreshCw, Activity } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { gameService } from '@/lib/api'; // Importar el servicio
import { useAuth } from '@/auth/AuthContext';

const GameList = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | GameStatus>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLiveUpdating, setIsLiveUpdating] = useState(true); 
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ROLE_ADMIN');

  // Cargar juegos al montar el componente
  useEffect(() => {
    fetchGames();
  }, []);

  // Actualización en tiempo real por defecto
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Siempre actualizar para usuarios normales, o cuando isLiveUpdating es true para admins
    if (!isAdmin || isLiveUpdating) {
      interval = setInterval(() => {
        fetchGames();
      }, 5000); // Actualizar cada 5 segundos
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveUpdating, isAdmin]);

  // Función para obtener juegos de la API
  const fetchGames = async () => {
    setIsRefreshing(true);
    try {
      const data = await gameService.getGames();
      console.log('Datos recibidos:', data);
      const formattedGames = data.map(game => ({
        id: game.id,
        name: game.name,
        status: (game.status?.toLowerCase() as GameStatus) || 'activo',
        players: game.players || 0,
        type: game.gameType || 'adventure',
        isPublic: game.isPublic || false,
        allowSpectators: game.allowSpectators || false,
        enableChat: game.enableChat || true,
        recordStats: game.recordStats || false,
        createdAt: game.createdAt || new Date().toISOString(),
        lastUpdated: game.lastUpdated || new Date().toISOString(),
        activeParticipants: game.activeParticipants || 0,
        averageTimePlayed: game.averageTimePlayed || 0
      }));
      
      setGames(formattedGames);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading games:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los juegos. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };
  
  // Apply filters
  const filteredGames = games.filter(game => {
    // Apply search filter
    const matchesSearch = game.name ? game.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || (game.status ? game.status === statusFilter : false);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <PageTransition>
      <div className="page-container">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Juegos</h1>
              <p className="text-muted-foreground mt-1">Gestiona y monitoriza todos tus juegos activos</p>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar juegos..."
                className="w-full bg-background border border-input rounded-md pl-10 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-muted-foreground" />
              <select
                className="bg-background border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              >
                <option value="all">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="pausado">Pausado</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
          
          {/* Indicador de carga y lista de juegos */}
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="animate-spin mx-auto mb-4 h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="text-muted-foreground">Cargando juegos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGames.length > 0 ? (
                filteredGames.map(game => (
                  <GameCard 
                    key={game.id} 
                    game={game} 
                    onStatusUpdate={fetchGames} 
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <p className="text-muted-foreground">No hay juegos que coincidan con tus filtros</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default GameList;
