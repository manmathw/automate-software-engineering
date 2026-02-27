import { useParams, Link } from 'react-router-dom';
import { useEvent, useEventStats, useSendInvites, useSendReminders } from '../../hooks/useEvents';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDateTime } from '../../lib/utils/format';
import { Pencil, Users, Send, Bell } from 'lucide-react';

const statusVariant: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  PUBLISHED: 'green',
  DRAFT: 'yellow',
  CANCELLED: 'red',
  COMPLETED: 'gray',
};

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: event, isLoading } = useEvent(id!);
  const { data: stats } = useEventStats(id!);
  const sendInvites = useSendInvites();
  const sendReminders = useSendReminders();

  if (isLoading || !event) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-gray-500 mt-1">{formatDateTime(event.eventDate)}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/events/${id}/edit`}>
            <Button variant="secondary" size="sm"><Pencil size={16} className="mr-1" /> Edit</Button>
          </Link>
          <Link to={`/events/${id}/guests`}>
            <Button variant="secondary" size="sm"><Users size={16} className="mr-1" /> Guests</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-5">
          <h3 className="font-medium text-gray-700 mb-3">Event Details</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24">Type:</dt>
              <dd>{event.occasionType.replace('_', ' ')}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24">Status:</dt>
              <dd><Badge variant={statusVariant[event.status] ?? 'gray'}>{event.status}</Badge></dd>
            </div>
            {event.venue && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-24">Venue:</dt>
                <dd>{event.venue}</dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24">Template:</dt>
              <dd>{event.templateId}</dd>
            </div>
          </dl>
        </div>

        {stats && (
          <div className="bg-white rounded-lg border p-5">
            <h3 className="font-medium text-gray-700 mb-3">RSVP Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">{stats.YES}</p>
                <p className="text-xs text-green-600">Attending</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-700">{stats.NO}</p>
                <p className="text-xs text-red-600">Declined</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-700">{stats.MAYBE}</p>
                <p className="text-xs text-yellow-600">Maybe</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-700">{stats.PENDING}</p>
                <p className="text-xs text-gray-600">Pending</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              {stats.emailsSent} emails sent · {stats.totalGuests} total guests
            </p>
          </div>
        )}
      </div>

      {event.description && (
        <div className="bg-white rounded-lg border p-5 mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Description</h3>
          <p className="text-gray-600 text-sm">{event.description}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={() => sendInvites.mutate(id!)}
          isLoading={sendInvites.isPending}
        >
          <Send size={16} className="mr-2" /> Send Invitations
        </Button>
        <Button
          variant="secondary"
          onClick={() => sendReminders.mutate(id!)}
          isLoading={sendReminders.isPending}
        >
          <Bell size={16} className="mr-2" /> Send Reminders
        </Button>
      </div>
    </div>
  );
}
