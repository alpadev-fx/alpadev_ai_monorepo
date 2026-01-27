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

export default function WelcomeEmail() {
  return (
    <Html>
      <Head />
      <Preview>
        Welcome to Alpadev - Your AI-Powered Software Partner.
      </Preview>
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
        <Body className="font-sans bg-black text-white" style={{ backgroundColor: "#000000", color: "#ffffff", margin: 0, padding: 0 }}>
           {/* Wrapper div to force full width background in clients that strip Body styles */}
          <div style={{ backgroundColor: "#000000", width: "100%", height: "100%", minHeight: "100vh" }}>
           <Container className="mx-auto px-4 py-5" style={{ backgroundColor: "#000000", color: "#ffffff", border: "1px solid #000000" }}>
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
              <Text className="text-xl font-bold leading-tight text-white">Welcome to Alpadev!</Text>
            </Section>

            <Section className="mt-2">
              <Text className="text-base text-gray-300">Hey there 👋,</Text>
              <Text className="text-base text-gray-300">
                Thanks for joining Alpadev! We&apos;re excited to help you transform your ideas into
                reality. Alpadev is your <span className="font-bold text-white">AI Software Partner</span>.
                We build scalable, high-performance web applications tailored to your needs.
              </Text>
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
              <Text className="m-0 p-0 font-medium">Best regards,</Text>
              <Text className="m-0 p-0 font-bold text-white">Team Alpadev</Text>
              <Text className="m-0 p-0">AI-Powered Software Development</Text>
            </Section>
          </Container>
          </div>
        </Body>
      </Tailwind>
    </Html>
  );
}
