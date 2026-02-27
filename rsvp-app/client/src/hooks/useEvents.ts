import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../lib/api/events';
import toast from 'react-hot-toast';

export function useEvents(page = 1) {
  return useQuery({
    queryKey: ['events', page],
    queryFn: () => eventsApi.list(page),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => eventsApi.get(id),
    enabled: !!id,
  });
}

export function useEventStats(id: string) {
  return useQuery({
    queryKey: ['events', id, 'stats'],
    queryFn: () => eventsApi.stats(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event created!');
    },
    onError: () => toast.error('Failed to create event'),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof eventsApi.update>[1] }) =>
      eventsApi.update(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['events', id] });
      qc.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event updated!');
    },
    onError: () => toast.error('Failed to update event'),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: eventsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted');
    },
    onError: () => toast.error('Failed to delete event'),
  });
}

export function useSendInvites() {
  return useMutation({
    mutationFn: eventsApi.sendInvites,
    onSuccess: (data) => toast.success(`Sent ${data.sent} invitations!`),
    onError: () => toast.error('Failed to send invitations'),
  });
}

export function useSendReminders() {
  return useMutation({
    mutationFn: eventsApi.sendReminders,
    onSuccess: (data) => toast.success(`Sent ${data.sent} reminders!`),
    onError: () => toast.error('Failed to send reminders'),
  });
}
