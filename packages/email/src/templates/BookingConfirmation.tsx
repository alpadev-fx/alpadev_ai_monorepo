import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface BookingConfirmationProps {
  guestName?: string;
  meetingDate?: string;
  meetingTime?: string;
  meetLink?: string;
  meetingDescription?: string;
}

export default function BookingConfirmation({
  guestName = "Guest",
  meetingDate = "Monday, January 26, 2026",
  meetingTime = "10:00 AM - 10:15 AM",
  meetLink = "https://meet.google.com/abc-defg-hij",
  meetingDescription,
}: BookingConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Booking Confirmed - Your meeting with Alpadev is scheduled.</Preview>
      <Tailwind
        config={{
          darkMode: "class",
          theme: {
            extend: {
              fontFamily: {
                sans: ["var(--font-sans)"],
              },
              colors: {
                brand: "#0a0a0a",
                primary: {
                  DEFAULT: "#000000",
                },
                secondary: {
                  DEFAULT: "#A855F7", // Purple-ish
                },
                accent: {
                  DEFAULT: "#22D3EE", // Cyan-ish
                },
              },
            },
          },
        }}
      >
        <Body className="font-sans bg-black text-white" style={{ backgroundColor: "#000000", color: "#ffffff", margin: 0, padding: 0 }}>
          {/* Wrapper div to force full width background in clients that strip Body styles */}
          <div style={{ backgroundColor: "#000000", width: "100%", height: "100%", minHeight: "100vh" }}>
            <Container className="mx-auto px-4 py-5 font-sans" style={{ backgroundColor: "#000000", color: "#ffffff", border: "1px solid #000000" }}>
            <Section className="mt-8">
              <Link href="https://alpadev.xyz">
                <Img
                  src="https://assets.alpadev.xyz/logo.jpg"
                  width="50"
                  height="50"
                  alt="Alpadev Logo"
                  className="rounded-full"
                />
              </Link>
            </Section>

            <Section className="mt-8">
              <Text className="text-xl font-bold leading-tight text-white">
                Booking Confirmed! 🚀
              </Text>
            </Section>

            <Section className="mt-2">
              <Text className="text-base text-gray-300">Hello {guestName},</Text>
              <Text className="text-base text-gray-300">
                Your video call with <span className="font-bold text-white">Alpadev</span> has been
                successfully scheduled. We are looking forward to speaking with you.
              </Text>
            </Section>

            <Section className="mt-6">
              <div
                style={{
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          padding: "16px",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                          backgroundColor: "rgba(255, 255, 255, 0.08)",
                        }}
                      >
                        <Text className="m-0 text-lg font-semibold text-white">
                          Meeting Details
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "16px" }}>
                        <table style={{ width: "100%" }}>
                          <tbody>
                            <tr>
                              <td style={{ width: "30%", paddingBottom: "8px", verticalAlign: "top" }}>
                                <Text className="m-0 text-sm font-medium text-gray-400">
                                  Date
                                </Text>
                              </td>
                              <td style={{ paddingBottom: "8px" }}>
                                <Text className="m-0 text-sm font-bold text-white">
                                  {meetingDate}
                                </Text>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ width: "30%", paddingBottom: "8px", verticalAlign: "top" }}>
                                <Text className="m-0 text-sm font-medium text-gray-400">
                                  Time
                                </Text>
                              </td>
                              <td style={{ paddingBottom: "8px" }}>
                                <Text className="m-0 text-sm font-bold text-white">
                                  {meetingTime}
                                </Text>
                              </td>
                            </tr>
                            {meetingDescription && (
                                <tr>
                                <td style={{ width: "30%", paddingBottom: "8px", verticalAlign: "top" }}>
                                    <Text className="m-0 text-sm font-medium text-gray-400">
                                    Notes
                                    </Text>
                                </td>
                                <td style={{ paddingBottom: "8px" }}>
                                    <Text className="m-0 text-sm text-gray-300">
                                    {meetingDescription}
                                    </Text>
                                </td>
                                </tr>
                            )}
                            <tr>
                              <td style={{ width: "30%", verticalAlign: "top" }}>
                                <Text className="m-0 text-sm font-medium text-gray-400">
                                  Where
                                </Text>
                              </td>
                              <td>
                                <Text className="m-0 text-sm font-bold text-cyan-400">
                                  Google Meet
                                </Text>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            <Section className="mt-8 text-center">
              <Button
                className="mx-auto flex w-fit items-center justify-center rounded-[8px] bg-gradient-to-r from-cyan-400 to-purple-500 px-[24px] py-[12px] text-center text-[14px] font-bold text-white shadow-lg"
                href={meetLink}
              >
                Join with Google Meet →
              </Button>
            </Section>

            <Hr className="mb-6 mt-8 border-gray-800" />

            <Section className="text-left text-sm text-gray-500">
              <Text className="m-0 p-0 font-medium">Best regards,</Text>
              <Text className="m-0 p-0 font-bold text-white">Alpadev Team</Text>
              <Text className="m-0 p-0">AI-Powered Software Development</Text>
            </Section>
          </Container>
          </div>
        </Body>
      </Tailwind>
    </Html>
  );
}
