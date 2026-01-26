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

interface TeamInvitationEmailProps {
  inviteeEmail?: string;
  inviterEmail?: string;
  projectName?: string;
}

export default function TeamInvitationEmail({
  inviterEmail = "inviter@example.com",
  projectName = "My Awesome Project",
}: TeamInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Invitation to Collaborate on Alpadev Project</Preview>
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
        <Body className="font-sans bg-black text-white">
          <Container className="mx-auto px-4 py-5">
            <Section className="mt-8">
              <Link href="https://alpadev.xyz">
                <Img
                  src="https://assets.alpadev.xyz/logo.png"
                  width="50"
                  height="50"
                  alt="Alpadev Logo"
                  className="rounded-full"
                />
              </Link>
            </Section>

            <Section className="mt-8">
              <Text className="text-xl font-bold leading-tight text-white">Project Invitation</Text>
            </Section>

            <Section className="mt-2">
              <Text className="text-base text-gray-300">Hello,</Text>
              <Text className="text-base text-gray-300">
                <span className="font-bold text-white">{inviterEmail}</span> has invited you to collaborate on
                the project <span className="font-bold text-white">{projectName}</span> on Alpadev.
              </Text>
            </Section>

            <Section className="mt-8 text-center">
              <Button
                className="mx-auto flex w-fit items-center justify-center rounded-[8px] bg-white px-[24px] py-[12px] text-center text-[14px] font-semibold text-black hover:bg-gray-200"
                href="https://alpadev.xyz/dashboard"
              >
                Access Project →
              </Button>
            </Section>

            <Section className="mt-4">
              <Text className="text-base text-gray-400">
                New to Alpadev?{" "}
                <Link href="https://alpadev.xyz" className="text-white underline">
                  Register here
                </Link>{" "}
                to get started.
              </Text>
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
