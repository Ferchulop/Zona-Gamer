import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/auth/AuthContext';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gameService } from '@/lib/api';

/**
 * Componente para mostrar notificaciones en tiempo real a los administradores
 * Se suscribe a un WebSocket para recibir alertas
 */
const AdminNotifications: React.FC = () => {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ROLE_ADMIN');
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Crear una referencia de audio al iniciar el componente
  useEffect(() => {
    // Log para depuración
    console.log("Inicializando componente AdminNotifications, cargando sonido");
    
    const audio = new Audio('/notification-sound.mp3');
    
    // Añadir listeners para depurar reproducción de audio
    audio.addEventListener('canplaythrough', () => {
      console.log('Audio cargado y listo para reproducir');
    });
    
    audio.addEventListener('error', (e) => {
      console.error('Error cargando audio:', e);
    });
    
    audio.addEventListener('play', () => {
      console.log('Audio iniciando reproducción');
    });
    
    audio.addEventListener('ended', () => {
      console.log('Audio reproducido completamente');
    });
    
    audioRef.current = audio;
    
    // Intentar reproducir el audio una vez al inicio para manejar permisos
    // (los navegadores requieren interacción del usuario para reproducir audio)
    const tryPlayOnce = () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.1; // Volumen bajo para la prueba
        audioRef.current.play()
          .then(() => {
            console.log("Prueba inicial de audio exitosa");
            audioRef.current?.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.volume = 1.0; // Restaurar volumen
          })
          .catch(err => {
            if (err.name === 'NotAllowedError') {
              console.warn("Permiso de audio no concedido. Las notificaciones no tendrán sonido hasta la interacción del usuario.");
            } else {
              console.error("Error en la prueba inicial de audio:", err);
            }
          });
      }
    };
    
    // Ejecutar después de un pequeño retraso
    setTimeout(tryPlayOnce, 1000);
    
    return () => {
      // Limpiar listeners al desmontar
      if (audioRef.current) {
        audioRef.current.removeEventListener('canplaythrough', () => {});
        audioRef.current.removeEventListener('error', () => {});
        audioRef.current.removeEventListener('play', () => {});
        audioRef.current.removeEventListener('ended', () => {});
      }
    };
  }, []);
  
  // Función para reproducir el sonido de notificación
  const playNotificationSound = () => {
    console.log("Intentando reproducir sonido de notificación");
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reiniciar el audio al inicio
      audioRef.current.play()
        .then(() => console.log("Sonido reproducido con éxito"))
        .catch(err => {
          console.error("Error reproduciendo sonido:", err);
          // Si el error es por falta de interacción, mostrar mensaje en consola
          if (err.name === 'NotAllowedError') {
            console.warn("No se puede reproducir audio automáticamente. Necesita interacción del usuario.");
            // Intentar mostrar una notificación que requiera interacción
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Alerta de Zona Gamer', {
                body: 'Se ha reportado un problema que requiere atención',
                icon: '/favicon.ico'
              });
            }
          }
        });
    } else {
      console.error("Elemento de audio no disponible");
    }
  };
  
  // Función para manejar la pausa del juego desde la notificación
  const handlePauseGame = async (gameId: string) => {
    try {
      await gameService.updateGameStatus(gameId, 'pausado');
      toast({
        title: "Juego pausado",
        description: "El juego ha sido pausado por mantenimiento",
      });
      
      // Actualizar la lista de notificaciones
      setNotifications(prev => prev.filter(n => n.gameId.toString() !== gameId.toString()));
      
      // Navegar al juego
      navigate(`/admin/games/${gameId}`);
    } catch (error) {
      console.error('Error al pausar el juego:', error);
      toast({
        title: "Error",
        description: "No se pudo pausar el juego",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    // Solo conectar si el usuario es administrador
    if (!isAdmin) {
      console.log("Usuario no es admin, no se conectará al WebSocket");
      return;
    }
    
    console.log("Iniciando conexión WebSocket para administrador");
    let client: Client | null = null;
    
    const connectWebSocket = () => {
      // Conectar directamente sin verificación previa
      try {
        console.log("Conectando con WebSocket estándar");
        client = new Client({
          brokerURL: 'ws://localhost:8081/ws/websocket',
          debug: function(str) {
            console.log('STOMP: ' + str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          // Añadir manejo de errores explícito
          onStompError: function(frame) {
            console.error('Error STOMP:', frame);
            setConnected(false);
          },
          onWebSocketError: function(event) {
            console.error('Error WebSocket:', event);
            setConnected(false);
          }
        });
        
        client.onConnect = function() {
          setConnected(true);
          console.log('Conectado a WebSocket para notificaciones de administrador');
          
          // Suscribirse al canal de notificaciones de administrador
          client?.subscribe('/topic/admin/notifications', function(message) {
            try {
              console.log('Mensaje recibido en canal admin/notifications:', message.body);
              const notification = JSON.parse(message.body);
              console.log('Notificación recibida:', notification);
              
              // Mostrar un toast para la notificación
              if (notification.type === 'GAME_ERROR' || notification.type === 'TEST_ADMIN') {
                console.log("Procesando notificación de tipo:", notification.type);
                
                // Agregar a la lista de notificaciones
                setNotifications(prev => {
                  // Evitar duplicados basados en gameId
                  if (notification.gameId && prev.some(n => n.gameId === notification.gameId)) {
                    return prev;
                  }
                  return [...prev, notification];
                });
                
                // Reproducir sonido de alerta
                playNotificationSound();
                
                // También mostrar alerta en la consola
                console.warn("ALERTA: Se ha reportado un problema con un juego", notification);
              }
            } catch (error) {
              console.error('Error al procesar notificación:', error);
            }
          });
        };
        
        client.activate();
        console.log("Cliente STOMP activado");
      } catch (e) {
        console.error("Error al crear cliente STOMP:", e);
      }
    };
    
    connectWebSocket();
    
    // Limpiar al desmontar
    return () => {
      if (client) {
        console.log("Desactivando cliente WebSocket");
        client.deactivate();
        setConnected(false);
      }
    };
  }, [isAdmin, toast]);
  
  // Si no hay notificaciones o no es admin, no renderizar el panel
  if (!isAdmin || notifications.length === 0) {
    return (
      connected ? (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 p-2 rounded text-xs">
          WebSocket conectado
        </div>
      ) : (
        <div className="fixed bottom-4 right-4 bg-yellow-100 text-yellow-800 p-2 rounded text-xs">
          WebSocket desconectado
        </div>
      )
    );
  }
  
  // Renderizar un panel de notificaciones pendientes
  return (
    <div className="fixed top-16 right-4 z-50 w-80 max-h-[80vh] overflow-auto">
      {notifications.map((notification, index) => (
        <div 
          key={index} 
          className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-800 dark:text-red-200 px-4 py-3 rounded mb-2 shadow-md animate-pulse"
        >
          <div className="flex items-start">
            <div className="py-1">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="font-bold">¡Problema reportado!</p>
              <p className="text-sm">{notification.message}</p>
              <div className="mt-2 flex gap-2">
                <button 
                  onClick={() => handlePauseGame(notification.gameId)}
                  className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  Pausar juego
                </button>
                <button 
                  onClick={() => navigate(`/admin/games/${notification.gameId}`)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  Ver detalles
                </button>
                <button 
                  onClick={() => setNotifications(prev => prev.filter((_, i) => i !== index))}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  Descartar
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminNotifications; 