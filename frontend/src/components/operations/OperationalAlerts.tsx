import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OperationalAlertsProps, AlertSeverity } from '@/types/operations';

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  { icon: typeof AlertTriangle; bgColor: string; borderColor: string; textColor: string; iconColor: string }
> = {
  critical: {
    icon: AlertTriangle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    iconColor: 'text-amber-500',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500',
  },
};

export function OperationalAlerts({ alerts, isLoading }: OperationalAlertsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Alertas Operativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-20 bg-slate-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Alertas Operativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-slate-500">
            <Info className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No hay alertas activas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort alerts by severity: critical first, then warning, then info
  const sortedAlerts = [...alerts].sort((a, b) => {
    const order: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Alertas Operativas
          <span className="ml-2 text-sm font-normal text-slate-500">
            ({alerts.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedAlerts.map((alert) => {
            const config = SEVERITY_CONFIG[alert.severity];
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
              >
                <div className="flex gap-3">
                  <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm ${config.textColor}`}>
                      {alert.title}
                    </h4>
                    <p className={`text-sm mt-1 ${config.textColor} opacity-80`}>
                      {alert.description}
                    </p>
                    {alert.value !== undefined && alert.threshold !== undefined && (
                      <div className="mt-2 flex items-center gap-4 text-xs">
                        <span className={config.textColor}>
                          Valor actual: <strong>{alert.value.toFixed(1)}%</strong>
                        </span>
                        <span className={`${config.textColor} opacity-70`}>
                          Umbral: {alert.threshold}%
                        </span>
                      </div>
                    )}
                    {alert.affectedRamos && alert.affectedRamos.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {alert.affectedRamos.map((ramo) => (
                          <span
                            key={ramo}
                            className={`inline-block px-2 py-0.5 text-xs rounded-full ${config.bgColor} ${config.textColor} border ${config.borderColor}`}
                          >
                            {ramo}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
