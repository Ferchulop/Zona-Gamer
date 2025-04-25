import React, { useState, useRef, useEffect } from 'react';
import { Game, GameStatus } from '@/lib/types';
import Card from './Card';
import { formatTimeElapsed, getStatusColor } from '@/lib/data';
import { Users, Clock, MoreVertical, CheckCircle, UserPlus, UserMinus } from 'lucide-react';
import { gameService } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/auth/AuthContext';

interface GameCardProps {
  game: Game;
  onStatusUpdate?: () => void; // Callback para actualizar la lista de juegos
}

const GameCard: React.FC<GameCardProps> = ({ game, onStatusUpdate }) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ROLE_ADMIN');

  // Comprobar si el usuario está participando en este juego
  useEffect(() => {
    const checkParticipation = async () => {
      try {
        const participating = await gameService.isUserParticipating(game.id.toString());
        setIsParticipating(participating);
      } catch (error) {
        console.error("Error al verificar participación:", error);
      }
    };
    
    if (game.status === 'activo') {
      checkParticipation();
    }
  }, [game.id, game.status]);

  // Cerrar el menú cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
    };

    if (showStatusMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusMenu]);

  // Función auxiliar para formatear la fecha
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Fecha no disponible';
    try {
      const dateObject = typeof date === 'string' ? new Date(date) : date;
      return dateObject.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Fecha no válida';
    }
  };

  // Función para manejar el plural/singular de jugadores
  const formatPlayerCount = (count: number) => {
    return `${count} ${count === 1 ? 'jugador' : 'jugadores'}`;
  };

  // Función para cambiar el estado del juego
  const handleStatusChange = async (newStatus: GameStatus) => {
    if (game.status === newStatus) {
      setShowStatusMenu(false);
      return;
    }

    setIsUpdating(true);
    try {
      await gameService.updateGameStatus(game.id.toString(), newStatus);
      toast({
        title: "Estado Actualizado",
        description: `El juego ahora está ${newStatus}`,
      });
      // Llamar al callback para actualizar la lista de juegos
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error('Error updating game status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del juego",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setShowStatusMenu(false);
    }
  };

  // Función para marcar como completado directamente (para usuarios normales)
  const handleMarkAsCompleted = () => {
    handleStatusChange('completado');
  };

  // Función para unirse/salir del juego
  const handleParticipation = async () => {
    if (game.status !== 'activo') {
      toast({
        title: "No disponible",
        description: "Solo puedes unirte a juegos activos",
        variant: "destructive",
      });
      return;
    }

    setIsJoiningGame(true);
    try {
      if (isParticipating) {
        await gameService.leaveGame(game.id.toString());
        setIsParticipating(false);
        toast({
          title: "Has salido del juego",
          description: `Ya no estás participando en ${game.name}`,
        });
      } else {
        await gameService.joinGame(game.id.toString());
        setIsParticipating(true);
        toast({
          title: "Te has unido al juego",
          description: `Ahora estás participando en ${game.name}`,
        });
      }
      
      // Actualizar la lista de juegos para reflejar los cambios
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error('Error managing game participation:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar tu solicitud",
        variant: "destructive",
      });
    } finally {
      setIsJoiningGame(false);
    }
  };

  return (
    <Card className="animate-scale-in">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-lg truncate flex-1">{game.name}</h3>
        
        {/* Contenedor del estado y menú en posición relativa */}
        <div className="flex items-center gap-2 relative" ref={menuRef}>
          <div className={`${getStatusColor(game.status)} text-white text-xs px-2 py-1 rounded-full`}>
            {game.status}
          </div>
          
          {/* Botón de acciones - Solo visible para administradores o usuarios según el caso */}
          {isAdmin ? (
            // Menú de opciones para administradores
            <>
              <button 
                className="p-1 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800"
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                aria-label="Opciones de estado"
              >
                <MoreVertical size={16} />
              </button>
              
              {/* Menú desplegable para administradores */}
              {showStatusMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-900 shadow-lg rounded-md overflow-hidden z-50 border dark:border-gray-800">
                  <div className="py-1">
                    <p className="px-4 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Cambiar estado
                    </p>
                    {isUpdating ? (
                      <div className="px-4 py-2 text-center">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                      </div>
                    ) : (
                      <>
                        <button
                          className={`px-4 py-2 text-sm w-full text-left ${game.status === 'activo' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                          onClick={() => handleStatusChange('activo')}
                        >
                          Activo
                        </button>
                        <button
                          className={`px-4 py-2 text-sm w-full text-left ${game.status === 'pausado' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                          onClick={() => handleStatusChange('pausado')}
                        >
                          Pausado
                        </button>
                        <button
                          className={`px-4 py-2 text-sm w-full text-left ${game.status === 'completado' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                          onClick={() => handleStatusChange('completado')}
                        >
                          Completado
                        </button>
                        <button
                          className={`px-4 py-2 text-sm w-full text-left ${game.status === 'cancelado' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                          onClick={() => handleStatusChange('cancelado')}
                        >
                          Cancelado
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Botón único para usuarios normales - Solo pueden marcar como completado
            <button
              className={`p-1 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800 ${game.status === 'completado' ? 'text-green-500' : ''} ${(game.status === 'cancelado' || game.status === 'pausado') ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleMarkAsCompleted}
              disabled={game.status === 'completado' || game.status === 'cancelado' || game.status === 'pausado' || isUpdating}
              title={
                game.status === 'completado' ? 'Juego completado' : 
                game.status === 'cancelado' ? 'No se puede completar un juego cancelado' :
                game.status === 'pausado' ? 'No se puede completar un juego pausado' :
                'Marcar como completado'
              }
            >
              <CheckCircle size={16} />
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users size={16} />
          <span>
            {game.activeParticipants ? 
              `${game.activeParticipants} activos de ${formatPlayerCount(game.players)}` : 
              formatPlayerCount(game.players)}
          </span>
        </div>
        
        {game.timeElapsed && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={16} />
            <span>
              {game.averageTimePlayed ? 
                `Promedio: ${Math.round(game.averageTimePlayed)} min. (${formatTimeElapsed(game.timeElapsed)})` :
                formatTimeElapsed(game.timeElapsed)}
            </span>
          </div>
        )}
      </div>
      
      {/* Botón para unirse/salir del juego (solo para usuarios normales y juegos activos) */}
      {!isAdmin && game.status === 'activo' && (
        <button
          className={`mt-3 flex items-center justify-center gap-2 w-full px-4 py-2 rounded-md ${isParticipating ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'} text-white transition-colors`}
          onClick={handleParticipation}
          disabled={isJoiningGame}
        >
          {isJoiningGame ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <>
              {isParticipating ? <UserMinus size={16} /> : <UserPlus size={16} />}
              <span>{isParticipating ? 'Salir del juego' : 'Unirse al juego'}</span>
            </>
          )}
        </button>
      )}
      
      <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs text-muted-foreground">
        <span>Creado: {formatDate(game.createdAt)}</span>
        <span>ID: {game.id}</span>
      </div>
    </Card>
  );
};

export default GameCard;
