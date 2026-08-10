// Registry of transactional email templates for roamyoo.
import { template as bookingConfirmation } from './booking-confirmation.tsx'
import { template as hostAcceptance } from './host-acceptance.tsx'
import { template as itineraryUpdate } from './itinerary-update.tsx'
import { template as welcome } from './welcome.tsx'

// deno-lint-ignore no-explicit-any
export interface TemplateEntry {
  // deno-lint-ignore no-explicit-any
  component: (props: any) => any
  // deno-lint-ignore no-explicit-any
  subject: string | ((data: any) => string)
  displayName?: string
  // deno-lint-ignore no-explicit-any
  previewData?: Record<string, any>
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'booking-confirmation': bookingConfirmation,
  'host-acceptance': hostAcceptance,
  'itinerary-update': itineraryUpdate,
  welcome,
}
