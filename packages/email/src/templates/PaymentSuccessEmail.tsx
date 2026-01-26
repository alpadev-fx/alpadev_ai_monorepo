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

export default function PaymentSuccessEmail() {
  return (
    <Html>
      <Head />
      <Preview>Payment Confirmed - Welcome to Alpadev Pro.</Preview>
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
                primary: { DEFAULT: "#000000" },
              },
            },
          },
        }}
      >
        <Body className="font-sans bg-black text-white" style={{ backgroundColor: "#000000", color: "#ffffff" }}>
          <Container className="mx-auto px-4 py-5" style={{ backgroundColor: "#000000" }}>
            <Section className="mt-8">
              <Link href="https://alpadev.xyz">
                <Img
                  src="https://alpadev.xyz/logo.svg"
                  width="50"
                  height="50"
                  alt="Alpadev Logo"
                  className="rounded-full"
                />
              </Link>
            </Section>

            <Section className="mt-8">
              <Text className="text-xl font-bold leading-tight text-white">Payment Confirmed! 🎉</Text>
            </Section>

            <Section className="mt-2">
              <Text className="text-base text-gray-300">Hello,</Text>
              <Text className="text-base text-gray-300">
                Your payment for the <span className="font-bold text-white">Pro Plan</span> has been
                successfully processed. Welcome to Alpadev, where we accelerate your digital future.
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
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          padding: "16px",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                          backgroundColor: "rgba(255, 255, 255, 0.08)",
                        }}
                      >
                        <Text className="m-0 text-lg font-semibold text-white">Plan Details</Text>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "16px" }}>
                        <table style={{ width: "100%" }}>
                          <tbody>
                            <tr>
                              <td style={{ width: "30%", paddingBottom: "8px" }}>
                                <Text className="m-0 text-sm font-medium text-gray-400">
                                  Plan Type
                                </Text>
                              </td>
                              <td style={{ paddingBottom: "8px" }}>
                                <Text className="m-0 text-sm font-bold text-white">Pro Plan</Text>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ width: "30%" }}>
                                <Text className="m-0 text-sm font-medium text-gray-400">
                                  Status
                                </Text>
                              </td>
                              <td>
                                <Text className="m-0 text-sm font-bold text-emerald-400">
                                  Active
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
                className="mx-auto flex w-fit items-center justify-center rounded-[8px] bg-white px-[24px] py-[12px] text-center text-[14px] font-semibold text-black hover:bg-gray-200"
                href="https://alpadev.xyz/dashboard"
              >
                Go to Dashboard →
              </Button>
            </Section>

            <Hr className="mb-6 mt-8 border-gray-800" />

            <Section className="text-left text-sm text-gray-500">
              <Text className="m-0 p-0 font-medium">Best,</Text>
              <Text className="m-0 p-0 font-bold text-white">Team Alpadev</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
