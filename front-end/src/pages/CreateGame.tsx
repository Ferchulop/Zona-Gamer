import React, { useState } from 'react';
import PageTransition from '@/components/ui-custom/PageTransition';
import Card from '@/components/ui-custom/Card';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { gameService } from '@/lib/api';

/* Página de creación de juego, permite a los usuarios crear un nuevo juego */
const CreateGame = () => {
  const [gameName, setGameName] = useState('');
  const [players, setPlayers] = useState('1');
  const [gameType, setGameType] = useState('adventure');
  const [isPublic, setIsPublic] = useState(false);
  const [allowSpectators, setAllowSpectators] = useState(false);
  const [enableChat, setEnableChat] = useState(true);
  const [recordStats, setRecordStats] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar el formulario
    if (!gameName.trim()) {
      toast({
        title: "Error",
        description: "Game name is required",
        variant: "destructive",
      });
      return;
    }
    
    // Mostrar estado de carga
    setIsSubmitting(true);
    
    try {
      // Crear un nuevo objeto de juego para enviar a la API
      const gameData = {
        name: gameName,
        players: parseInt(players),
        gameType: gameType,
        isPublic: isPublic,
        allowSpectators: allowSpectators,
        enableChat: enableChat,
        recordStats: recordStats
      };
      
      console.log('Sending data to API:', gameData);
      
      // Enviar a la API
      await gameService.createGame(gameData);
      
      toast({
        title: "Juego Creado",
        description: `${gameName} se ha creado correctamente`,
      });
      
      // Redirigir a la lista de juegos
      navigate('/games');
    } catch (error) {
      console.error('Detalles del error:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      toast({
        title: "Error",
        description: "Failed to create game. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // Componente de la página de creación de juego
  return (
    <PageTransition>
      <div className="page-container">
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Juego</h1>
            <p className="text-muted-foreground mt-1">Configurar una nueva sesión de juego</p>
          </div>
          
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="gameName" className="text-sm font-medium">
                  Nombre del Juego
                </label>
                <input
                  id="gameName"
                  type="text"
                  placeholder="Introduce nombre del juego"
                  className="w-full bg-background border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="players" className="text-sm font-medium">
                  Numero de Jugadores
                </label>
                <input
                  id="players"
                  type="number"
                  min="1"
                  max="100"
                  className="w-full bg-background border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  value={players}
                  onChange={(e) => setPlayers(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="gameType" className="text-sm font-medium">
                  Tipo de Juego
                </label>
                <select
                  id="gameType"
                  className="w-full bg-background border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  value={gameType}
                  onChange={(e) => setGameType(e.target.value)}
                >
                  <option value="aventura">Aventura</option>
                  <option value="estrategia">Estrategia</option>
                  <option value="accion">Accion</option>
                  <option value="puzzle">Puzzle</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Ajustes del Juego
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      id="publicGame"
                      type="checkbox"
                      className="h-4 w-4 border border-input rounded focus:ring-ring"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                    />
                    <label htmlFor="publicGame">Juego Publico</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="allowSpectators"
                      type="checkbox"
                      className="h-4 w-4 border border-input rounded focus:ring-ring"
                      checked={allowSpectators}
                      onChange={(e) => setAllowSpectators(e.target.checked)}
                    />
                    <label htmlFor="allowSpectators">Permitir Espectadores</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="enableChat"
                      type="checkbox"
                      className="h-4 w-4 border border-input rounded focus:ring-ring"
                      checked={enableChat}
                      onChange={(e) => setEnableChat(e.target.checked)}
                    />
                    <label htmlFor="enableChat">Habilitar Chat</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="recordStats"
                      type="checkbox"
                      className="h-4 w-4 border border-input rounded focus:ring-ring"
                      checked={recordStats}
                      onChange={(e) => setRecordStats(e.target.checked)}
                    />
                    <label htmlFor="recordStats">Registrar Estadisticas</label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creando...' : 'Crear Juego'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default CreateGame;
