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
  hostName?: string
  experienceTitle?: string
  location?: string
  startDate?: string
  endDate?: string
  guests?: number | string
  totalPrice?: string
  bookingUrl?: string
}

const Email = ({
  travelerName,
  hostName = 'your host',
  experienceTitle = 'your trip',
  location,
  startDate,
  endDate,
  guests,
  totalPrice,
  bookingUrl = `${brand.siteUrl}/dashboard/traveler?tab=bookings`,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {brand.siteName} booking is confirmed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>Booking confirmed</Text>
        <Heading style={h1}>
          {travelerName ? `${travelerName}, you're going!` : "You're going!"}
        </Heading>
        <Text style={text}>
          {hostName} has confirmed your booking for <strong>{experienceTitle}</strong>
          {location ? ` in ${location}` : ''}. Here are your details.
        </Text>

        <Section style={card}>
          {(startDate || endDate) && (
            <>
              <Text style={rowLabel}>Dates</Text>
              <Text style={rowValue}>
                {startDate}
                {endDate ? ` – ${endDate}` : ''}
              </Text>
            </>
          )}
          {guests && (
            <>
              <Text style={rowLabel}>Guests</Text>
              <Text style={rowValue}>{guests}</Text>
            </>
          )}
          {totalPrice && (
            <>
              <Text style={rowLabel}>Total</Text>
              <Text style={rowValue}>{totalPrice}</Text>
            </>
          )}
          <Text style={rowLabel}>Host</Text>
          <Text style={{ ...rowValue, margin: '0' }}>{hostName}</Text>
        </Section>

        <Button style={button} href={bookingUrl}>
          View booking details
        </Button>

        <Hr style={{ borderColor: brand.border, margin: '28px 0 0' }} />
        <Text style={footer}>
          Need to change something? Message your host from your {brand.siteName} dashboard.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Props) =>
    data?.experienceTitle
      ? `Booking confirmed: ${data.experienceTitle}`
      : 'Your booking is confirmed',
  displayName: 'Booking confirmation',
  previewData: {
    travelerName: 'Aditi',
    hostName: 'Ravi Sharma',
    experienceTitle: 'Old City Heritage Walk',
    location: 'Jaipur',
    startDate: '12 Sep 2026',
    endDate: '15 Sep 2026',
    guests: 2,
    totalPrice: '₹12,400',
  },
} satisfies TemplateEntry
