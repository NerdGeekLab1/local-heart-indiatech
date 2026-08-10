/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import {
  brand,
  button,
  card,
  container,
  eyebrow,
  footer,
  h1,
  main,
  rowLabel,
  rowValue,
  text,
} from './theme.ts'

interface Props {
  travelerName?: string
  tripTitle?: string
  updatedBy?: string
  changeSummary?: string
  newStartDate?: string
  newEndDate?: string
  itineraryUrl?: string
}

const Email = ({
  travelerName,
  tripTitle = 'your trip',
  updatedBy = 'your host',
  changeSummary,
  newStartDate,
  newEndDate,
  itineraryUrl = `${brand.siteUrl}/dashboard/traveler?tab=bookings`,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your itinerary for {tripTitle} was updated</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>Itinerary update</Text>
        <Heading style={h1}>
          {travelerName ? `${travelerName}, your plans changed` : 'Your plans changed'}
        </Heading>
        <Text style={text}>
          {updatedBy} updated the itinerary for <strong>{tripTitle}</strong>. Review the changes and
          confirm they work for you.
        </Text>

        <Section style={card}>
          {changeSummary && (
            <>
              <Text style={rowLabel}>What changed</Text>
              <Text style={rowValue}>{changeSummary}</Text>
            </>
          )}
          {(newStartDate || newEndDate) && (
            <>
              <Text style={rowLabel}>Updated dates</Text>
              <Text style={{ ...rowValue, margin: '0' }}>
                {newStartDate}
                {newEndDate ? ` – ${newEndDate}` : ''}
              </Text>
            </>
          )}
          {!changeSummary && !newStartDate && !newEndDate && (
            <Text style={{ ...rowValue, margin: '0' }}>
              Open your itinerary to see the latest schedule.
            </Text>
          )}
        </Section>

        <Button style={button} href={itineraryUrl}>
          View updated itinerary
        </Button>

        <Hr style={{ borderColor: brand.border, margin: '28px 0 0' }} />
        <Text style={footer}>
          Questions about this change? Reply to {updatedBy} in your {brand.siteName} messages.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Props) =>
    data?.tripTitle ? `Itinerary updated: ${data.tripTitle}` : 'Your itinerary was updated',
  displayName: 'Itinerary update',
  previewData: {
    travelerName: 'Aditi',
    tripTitle: 'Spiti Valley Road Trip',
    updatedBy: 'Ravi Sharma',
    changeSummary: 'Day 3 activity moved to the morning slot',
    newStartDate: '12 Sep 2026',
    newEndDate: '16 Sep 2026',
  },
} satisfies TemplateEntry
