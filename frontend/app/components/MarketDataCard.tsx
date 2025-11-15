import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import type { ReactNode } from "react";

interface MarketDataCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
  };
}

export function MarketDataCard({
  title,
  value,
  description,
  trend,
  icon,
  badge,
}: MarketDataCardProps) {
  return (
    <Card className="hover:border-primary/30 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {badge && (
            <Badge variant={badge.variant || 'default'} className="text-xs">
              {badge.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {trend && (
            <span
              className={`text-sm font-medium ${
                trend === 'up'
                  ? 'text-[oklch(0.75_0.20_130)]'
                  : trend === 'down'
                  ? 'text-[oklch(0.55_0.22_25)]'
                  : 'text-muted-foreground'
              }`}
            >
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
            </span>
          )}
        </div>
        {description && (
          <CardDescription className="mt-2">{description}</CardDescription>
        )}
      </CardContent>
    </Card>
  );
}
