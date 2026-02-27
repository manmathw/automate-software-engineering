import React from 'react';
import { Text, Section } from '@react-email/components';
import { BaseLayout } from '../components/BaseLayout';

const occasionTheme: Record<string, { primary: string; emoji: string }> = {
  BIRTHDAY: { primary: '#f59e0b', emoji: '🎂' },
  ANNIVERSARY: { primary: '#ec4899', emoji: '💍' },
  WEDDING: { primary: '#8b5cf6', emoji: '💒' },
  GRADUATION: { primary: '#10b981', emoji: '🎓' },
  CORPORATE: { primary: '#3b82f6', emoji: '💼' },
  BABY_SHOWER: { primary: '#f472b6', emoji: '👶' },
  RETIREMENT: { primary: '#f97316', emoji: '🌅' },
  HOLIDAY_PARTY: { primary: '#ef4444', emoji: '🎄' },
  OTHER: { primary: '#6366f1', emoji: '🎉' },
};

const responseMessages: Record<string, string> = {
  YES: "We're thrilled you'll be joining us! 🎉",
  NO: "We'll miss you, but thank you for letting us know.",
  MAYBE: "We hope to see you there! We'll keep your spot open.",
};

interface RsvpConfirmationEmailProps {
  guestFirstName: string;
  eventTitle: string;
  occasionType: string;
  eventDate: string;
  venue?: string;
  response: 'YES' | 'NO' | 'MAYBE';
  plusOneCount?: number;
}

export function RsvpConfirmationEmail({
  guestFirstName,
  eventTitle,
  occasionType,
  eventDate,
  venue,
  response,
  plusOneCount = 0,
}: RsvpConfirmationEmailProps) {
  const theme = occasionTheme[occasionType] || occasionTheme.OTHER;

  return (
    <BaseLayout primaryColor={theme.primary}>
      <Text style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
        {theme.emoji} RSVP Confirmation
      </Text>
      <Text style={{ color: '#374151', fontSize: '16px' }}>
        Hi {guestFirstName}! {responseMessages[response]}
      </Text>
      <Section style={{ backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '16px', margin: '16px 0' }}>
        <Text style={{ margin: 0, color: '#111827' }}>
          <strong>Event:</strong> {eventTitle}
        </Text>
        <Text style={{ margin: '8px 0 0', color: '#111827' }}>
          <strong>📅 Date:</strong> {eventDate}
        </Text>
        {venue && (
          <Text style={{ margin: '8px 0 0', color: '#111827' }}>
            <strong>📍 Venue:</strong> {venue}
          </Text>
        )}
        <Text style={{ margin: '8px 0 0', color: '#111827' }}>
          <strong>Your RSVP:</strong> {response}
        </Text>
        {plusOneCount > 0 && (
          <Text style={{ margin: '8px 0 0', color: '#111827' }}>
            <strong>Plus ones:</strong> {plusOneCount}
          </Text>
        )}
      </Section>
      <Text style={{ color: '#6b7280', fontSize: '14px' }}>
        Need to change your response? Use the original invitation link.
      </Text>
    </BaseLayout>
  );
}
