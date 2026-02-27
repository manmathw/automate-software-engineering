import { apiClient } from './client';

export interface Event {
  id: string;
  title: string;
  description?: string;
  occasionType: string;
  status: string;
  eventDate: string;
  venue?: string;
  templateId: string;
  _count?: { guests: number };
  createdAt: string;
}

export interface EventStats {
  YES: number;
  NO: number;
  MAYBE: number;
  PENDING: number;
  totalGuests: number;
  emailsSent: number;
}

export const eventsApi = {
  list: async (page = 1, limit = 10) => {
    const { data } = await apiClient.get('/events', { params: { page, limit } });
    return data;
  },
  get: async (id: string): Promise<Event> => {
    const { data } = await apiClient.get(`/events/${id}`);
    return data;
  },
  create: async (payload: Omit<Event, 'id' | '_count' | 'createdAt'>) => {
    const { data } = await apiClient.post('/events', payload);
    return data;
  },
  update: async (id: string, payload: Partial<Event>) => {
    const { data } = await apiClient.patch(`/events/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/events/${id}`);
  },
  stats: async (id: string): Promise<EventStats> => {
    const { data } = await apiClient.get(`/events/${id}/stats`);
    return data;
  },
  sendInvites: async (id: string) => {
    const { data } = await apiClient.post(`/events/${id}/send-invites`);
    return data;
  },
  sendReminders: async (id: string) => {
    const { data } = await apiClient.post(`/events/${id}/send-reminders`);
    return data;
  },
};
