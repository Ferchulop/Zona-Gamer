/**
 * 
 * Tarjeta especializada para mostrar métricas y estadísticas en dashboards.
 * Muestra un valor principal con su etiqueta descriptiva y un indicador de
 * cambio (positivo o negativo) con iconos visuales.
 * 
 * - Muestra una métrica con su etiqueta descriptiva
 * - Incluye indicador visual de tendencia (arriba/abajo)
 * - Colorea el cambio en verde (positivo) o rojo (negativo)
 * - Muestra el porcentaje de cambio
 * 
 */

import React from 'react';
import { GameMetric } from '@/lib/types';
import Card from './Card';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface StatCardProps {
  metric: GameMetric;
}

const StatCard: React.FC<StatCardProps> = ({ metric }) => {
  const isPositive = metric.change >= 0;
  
  return (
    <Card glass className="flex flex-col h-full">
      <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
      <div className="flex items-end justify-between mt-3">
        <h3 className="text-2xl font-bold">{metric.value}</h3>
        <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{isPositive ? '+' : ''}{metric.change}%</span>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
