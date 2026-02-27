import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { toInputDatetime } from '../../lib/utils/format';

const OCCASION_TYPES = [
  'BIRTHDAY', 'ANNIVERSARY', 'WEDDING', 'GRADUATION',
  'CORPORATE', 'BABY_SHOWER', 'RETIREMENT', 'HOLIDAY_PARTY', 'OTHER',
];

const TEMPLATES = [
  { id: 'classic', name: 'Classic Elegance' },
  { id: 'modern', name: 'Modern Minimal' },
  { id: 'festive', name: 'Festive Fun' },
  { id: 'formal', name: 'Formal Affair' },
];

interface EventFormData {
  title: string;
  description: string;
  occasionType: string;
  eventDate: string;
  venue: string;
  templateId: string;
  status?: string;
}

interface EventFormProps {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  isLoading?: boolean;
  submitLabel?: string;
  showStatus?: boolean;
}

export function EventForm({ initialData, onSubmit, isLoading, submitLabel = 'Save', showStatus }: EventFormProps) {
  const [form, setForm] = useState<EventFormData>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    occasionType: initialData?.occasionType ?? 'OTHER',
    eventDate: initialData?.eventDate ? toInputDatetime(initialData.eventDate) : '',
    venue: initialData?.venue ?? '',
    templateId: initialData?.templateId ?? 'classic',
    status: initialData?.status ?? 'DRAFT',
  });

  const handleChange = (field: keyof EventFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, eventDate: new Date(form.eventDate).toISOString() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input id="title" label="Event Title" value={form.title} onChange={handleChange('title')} required />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={3}
          value={form.description}
          onChange={handleChange('description')}
          placeholder="Tell guests about the event..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Occasion Type</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={form.occasionType}
            onChange={handleChange('occasionType')}
          >
            {OCCASION_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Template</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={form.templateId}
            onChange={handleChange('templateId')}
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <Input
        id="eventDate"
        label="Event Date & Time"
        type="datetime-local"
        value={form.eventDate}
        onChange={handleChange('eventDate')}
        required
      />

      <Input id="venue" label="Venue" value={form.venue} onChange={handleChange('venue')} placeholder="Address or location" />

      {showStatus && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={form.status}
            onChange={handleChange('status')}
          >
            {['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
