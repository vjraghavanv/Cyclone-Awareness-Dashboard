import { useData } from '../contexts';

type StatusColor = 'green' | 'yellow' | 'red';

export function SystemStatus() {
  const { healthStatus } = useData();

  // Calculate overall system status
  const getSystemStatus = (): StatusColor => {
    const endpoints = Object.values(healthStatus);
    
    if (endpoints.length === 0) {
      return 'yellow'; // Unknown status
    }

    const healthyCount = endpoints.filter(Boolean).length;
    const totalCount = endpoints.length;
    const healthPercentage = (healthyCount / totalCount) * 100;

    if (healthPercentage === 100) {
      return 'green'; // All healthy
    } else if (healthPercentage >= 50) {
      return 'yellow'; // Some issues
    } else {
      return 'red'; // Major issues
    }
  };

  const status = getSystemStatus();

  const statusColors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  const statusLabels = {
    green: 'Operational',
    yellow: 'Degraded',
    red: 'Outage',
  };

  return (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      <div
        className={`w-3 h-3 rounded-full ${statusColors[status]}`}
        aria-hidden="true"
      />
      <span className="text-sm font-medium text-gray-700">
        {statusLabels[status]}
      </span>
    </div>
  );
}
