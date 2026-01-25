import { google } from 'googleapis';

export class CalendarService {
  private static getOAuth2Client() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Missing Google Calendar credentials in environment variables');
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return oauth2Client;
  }

  static async createEventWithMeet(details: {
    name: string;
    email: string;
    startTime: string; // ISO string
    endTime: string;   // ISO string
    summary: string;
    description?: string;
  }): Promise<{ meetLink: string; eventId: string }> {
    const auth = this.getOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth });
    
    // ConferenceDataVersion 1 is required to generate Meet links
    const event = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      conferenceDataVersion: 1, 
      requestBody: {
        summary: details.summary,
        description: details.description,
        start: { dateTime: details.startTime },
        end: { dateTime: details.endTime },
        attendees: [{ email: details.email }],
        conferenceData: {
          createRequest: {
            requestId: `meeting-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    const meetLink = event.data.hangoutLink || '';
    const eventId = event.data.id || '';

    if (!meetLink) {
        console.warn('Google Meet link was not generated automatically.');
    }

    return { meetLink, eventId };
  }
}
