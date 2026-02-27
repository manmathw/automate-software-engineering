import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvents, useDeleteEvent } from '../../hooks/useEvents';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils/format';
import { Plus, Trash2, Pencil, Users } from 'lucide-react';

const statusVariant: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  PUBLISHED: 'green',
  DRAFT: 'yellow',
  CANCELLED: 'red',
  COMPLETED: 'gray',
};

export function EventsListPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useEvents(page);
  const deleteEvent = useDeleteEvent();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const events = data?.events ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link to="/events/new">
          <Button size="sm">
            <Plus size={16} className="mr-1" /> New Event
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-lg border p-10 text-center">
          <p className="text-gray-500 mb-4">No events yet</p>
          <Link to="/events/new">
            <Button>Create your first event</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border divide-y">
          {events.map((event: { id: string; title: string; occasionType: string; status: string; eventDate: string; _count?: { guests: number } }) => (
            <div key={event.id} className="flex items-center justify-between p-4">
              <Link to={`/events/${event.id}`} className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{event.title}</p>
                <p className="text-sm text-gray-500">
                  {event.occasionType.replace('_', ' ')} · {formatDate(event.eventDate)}
                </p>
              </Link>
              <div className="flex items-center gap-3 ml-4">
                <Badge variant={statusVariant[event.status] ?? 'gray'}>{event.status}</Badge>
                <span className="text-sm text-gray-500">{event._count?.guests ?? 0} guests</span>
                <Link to={`/events/${event.id}/guests`}>
                  <Button variant="ghost" size="sm"><Users size={16} /></Button>
                </Link>
                <Link to={`/events/${event.id}/edit`}>
                  <Button variant="ghost" size="sm"><Pencil size={16} /></Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Delete this event?')) deleteEvent.mutate(event.id);
                  }}
                >
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="flex items-center text-sm text-gray-600">
            Page {page} of {data.totalPages}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
