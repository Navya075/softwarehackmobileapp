import { API_BASE_URL } from './apiClient';
import { useVehicleStore } from '../store/useVehicleStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { NotificationEventType, NotificationSeverity } from '../types';

let socket: WebSocket | null = null;
let reconnectTimer: any = null;
let pingInterval: any = null;

const getWsUrl = (): string => {
  const httpUrl = API_BASE_URL;
  const wsProto = httpUrl.startsWith('https') ? 'wss' : 'ws';
  const cleanHost = httpUrl.replace(/^https?:\/\//, '');
  return `${wsProto}://${cleanHost}/ws/live?user_id=user_demo_01`;
};

export const websocketService = {
  connect() {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const url = getWsUrl();
      socket = new WebSocket(url);

      socket.onopen = () => {
        // Start ping interval
        if (pingInterval) clearInterval(pingInterval);
        pingInterval = setInterval(() => {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send('ping');
          }
        }, 30000);
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { type, data } = message;

          if (type === 'telemetry_snapshot' || type === 'telemetry_update') {
            useVehicleStore.getState().updateTelemetry({
              current_soc: data.current_soc,
              target_soc: data.target_soc,
              charging_status: data.charging_status,
              charging_power_kw: data.charging_power_kw,
              plug_status: data.plug_status,
              voltage_v: data.voltage_v,
              current_a: data.current_a,
              estimated_range_km: data.estimated_range_km,
              energy_delivered_kwh: data.energy_delivered_kwh,
              estimated_completion_time: data.estimated_completion_time,
              departure_time: data.departure_time,
              last_updated: data.last_updated || 'Just now',
            });
          } else if (type === 'charging_state_change') {
            if (data.action === 'paused') {
              useVehicleStore.getState().updateTelemetry({
                charging_status: 'paused',
                charging_power_kw: 0.0,
              });
            } else if (data.action === 'resumed' || data.action === 'started') {
              useVehicleStore.getState().updateTelemetry({
                charging_status: 'charging',
              });
            } else if (data.action === 'completed') {
              useVehicleStore.getState().updateTelemetry({
                charging_status: 'completed',
                charging_power_kw: 0.0,
              });
            }
          } else if (type === 'notification') {
            useNotificationStore.getState().addNotification({
              title: data.title,
              message: data.message,
              type: (data.type as NotificationEventType) || 'alert',
              severity: (data.severity as NotificationSeverity) || 'info',
              action_label: data.action_label,
            });
          }
        } catch (e) {
          // ignore pong or non-json message
        }
      };

      socket.onclose = () => {
        if (pingInterval) clearInterval(pingInterval);
        // Attempt reconnect after 5s
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            websocketService.connect();
          }, 5000);
        }
      };

      socket.onerror = () => {
        // Socket closed will trigger reconnect
      };
    } catch (e) {
      // Offline fallback
    }
  },

  disconnect() {
    if (pingInterval) clearInterval(pingInterval);
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (socket) {
      socket.close();
      socket = null;
    }
  },
};
