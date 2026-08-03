import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';

export interface KpiWidgetProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
  glowColor?: 'cyan' | 'violet' | 'success' | 'none';
}

export const KpiWidget: React.FC<KpiWidgetProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  subtitle,
  glowColor = 'cyan',
}) => {
  return (
    <Card hoverable glowColor={glowColor} className="flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2">
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-xl bg-[var(--surface-l2)] text-[var(--accent-primary)] border border-[var(--border-rim)]">
            {icon}
          </div>
        )}
      </div>

      <div className="my-2">
        <div className="text-2xl lg:text-3xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
          {value}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-rim)] text-xs">
        {change && (
          <Badge variant={isPositive ? 'success' : 'danger'} size="sm">
            {isPositive ? '↑' : '↓'} {change}
          </Badge>
        )}
        {subtitle && (
          <span className="text-[var(--text-muted)] text-[11px] font-mono">{subtitle}</span>
        )}
      </div>
    </Card>
  );
};
