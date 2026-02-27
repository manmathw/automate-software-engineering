import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRsvp, useSubmitRsvp } from '../../hooks/useRsvp';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../lib/utils/format';
import toast from 'react-hot-toast';

const occasionEmoji: Record<string, string> = {
  BIRTHDAY: '🎂', ANNIVERSARY: '💍', WEDDING: '💒', GRADUATION: '🎓',
  CORPORATE: '💼', BABY_SHOWER: '👶', RETIREMENT: '🌅', HOLIDAY_PARTY: '🎄', OTHER: '🎉',
};

export function RsvpPage() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, error } = useRsvp(token!);
  const submitRsvp = useSubmitRsvp(token!);

  const [response, setResponse] = useState<'YES' | 'NO' | 'MAYBE' | ''>('');
  const [plusOneCount, setPlusOneCount] = useState(0);
  const [dietaryPreferences, setDietaryPreferences] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800 mb-2">Invitation not found</p>
          <p className="text-gray-500">This invitation link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const { firstName, event } = data;
  const emoji = occasionEmoji[event.occasionType] ?? '🎉';

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-4xl mb-4">
            {response === 'YES' ? '🎉' : response === 'NO' ? '😢' : '🤔'}
          </p>
          <h2 className="text-2xl font-bold mb-2">Thank you, {firstName}!</h2>
          <p className="text-gray-600">
            {response === 'YES' && "We're excited to see you!"}
            {response === 'NO' && "We'll miss you, but thanks for letting us know."}
            {response === 'MAYBE' && "We hope to see you there!"}
          </p>
          <p className="text-sm text-gray-400 mt-4">A confirmation email has been sent to you.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!response) {
      toast.error('Please select your RSVP response');
      return;
    }
    try {
      await submitRsvp.mutateAsync({
        response,
        plusOneCount,
        dietaryPreferences: dietaryPreferences || undefined,
        message: message || undefined,
      });
      setSubmitted(true);
    } catch {
      toast.error('Failed to submit RSVP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <p className="text-5xl mb-3">{emoji}</p>
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          <p className="text-gray-500 mt-1">{formatDate(event.eventDate)}</p>
          {event.venue && <p className="text-gray-500 text-sm">{event.venue}</p>}
        </div>

        <p className="text-gray-700 mb-6 text-center">
          Hi <strong>{firstName}</strong>! Please let us know if you can attend.
        </p>

        {data.rsvp && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-700">
            You previously responded: <strong>{data.rsvp.response}</strong>. You can update your response below.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Will you attend?</p>
            <div className="grid grid-cols-3 gap-2">
              {(['YES', 'NO', 'MAYBE'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setResponse(r)}
                  className={`py-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                    response === r
                      ? r === 'YES' ? 'border-green-500 bg-green-50 text-green-700'
                      : r === 'NO' ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {r === 'YES' ? '✓ Yes' : r === 'NO' ? '✗ No' : '? Maybe'}
                </button>
              ))}
            </div>
          </div>

          {response === 'YES' && data.plusOneAllowed && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Plus ones</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={plusOneCount}
                onChange={(e) => setPlusOneCount(Number(e.target.value))}
              >
                {[0, 1, 2, 3].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Dietary preferences (optional)</label>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={dietaryPreferences}
              onChange={(e) => setDietaryPreferences(e.target.value)}
              placeholder="Vegetarian, gluten-free, etc."
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Message to organizer (optional)</label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Looking forward to it!"
            />
          </div>

          <Button type="submit" className="w-full" isLoading={submitRsvp.isPending}>
            Submit RSVP
          </Button>
        </form>
      </div>
    </div>
  );
}
