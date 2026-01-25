# Appointment Booking Feature

This directory contains the Booking Feature components.

## Usage

Import and use `CalendarBooking` in your page:

```tsx
import CalendarBooking from '@/components/booking/calendar-booking';

export default function Page() {
  return (
    <div className="flex h-screen items-center justify-center">
      <CalendarBooking />
    </div>
  );
}
```

## Setup & Credentials

To make the Google Calendar integration work, you need to set the following environment variables in your `.env.local`:

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_CALENDAR_ID=primary
```

### How to get the Refresh Token

1.  **Google Cloud Console**:
    *   Create a project.
    *   Enable **Google Calendar API**.
    *   Create **OAuth 2.0 Credentials** (Web Application).
    *   Add `https://developers.google.com/oauthplayground` to **Authorized redirect URIs**.

2.  **OAuth2 Playground**:
    *   Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground).
    *   Click the **Gear Icon** (Configuration) -> check **Use your own OAuth credentials** -> Enter your Client ID and Secret.
    *   In **Select & authorize APIs**, verify `https://www.googleapis.com/auth/calendar` and `https://www.googleapis.com/auth/calendar.events`.
    *   Click **Authorize APIs**.
    *   Click **Exchange authorization code for tokens**.
    *   Copy the **Refresh Token**.

> **Note**: Store the Refresh Token securely. It allows offline access to your calendar without user interaction.
