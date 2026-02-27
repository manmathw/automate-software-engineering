import { useEvents } from '../../hooks/useEvents';
import { formatDate } from '../../lib/utils/format';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';
import { Calendar, Users, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const statusVariant: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  PUBLISHED: 'green',
  DRAFT: 'yellow',
  CANCELLED: 'red',
  COMPLETED: 'gray',
};

export function DashboardPage() {
  const { data, isLoading } = useEvents();

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/events/new">
          <Button size="sm">
            <Plus size={16} className="mr-1" /> New Event
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-5">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-primary-500" size={20} />
            <span className="text-sm text-gray-500">Total Events</span>
          </div>
          <p className="text-3xl font-bold">{data?.total ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-green-500" size={20} />
            <span className="text-sm text-gray-500">Published</span>
          </div>
          <p className="text-3xl font-bold">
            {events.filter((e: { status: string }) => e.status === 'PUBLISHED').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-yellow-500" size={20} />
            <span className="text-sm text-gray-500">Upcoming</span>
          </div>
          <p className="text-3xl font-bold">
            {events.filter((e: { eventDate: string }) => new Date(e.eventDate) > new Date()).length}
          </p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">Recent Events</h2>
      {events.length === 0 ? (
        <div className="bg-white rounded-lg border p-10 text-center">
          <p className="text-gray-500 mb-4">No events yet</p>
          <Link to="/events/new">
            <Button>Create your first event</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border divide-y">
          {events.slice(0, 5).map((event: { id: string; title: string; occasionType: string; status: string; eventDate: string; _count?: { guests: number } }) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">{event.title}</p>
                <p className="text-sm text-gray-500">{formatDate(event.eventDate)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{event._count?.guests ?? 0} guests</span>
                <Badge variant={statusVariant[event.status] ?? 'gray'}>{event.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
