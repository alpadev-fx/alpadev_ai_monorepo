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
} from "@react-email/components"

interface TeamInvitationEmailProps {
  username?: string
  teamName?: string
  inviteLink?: string
  userImage?: string
  teamImage?: string
}

export default function TeamInvitationEmail({
  username = "there",
  teamName = "Alpadev Team",
  inviteLink = "https://alpadev.xyz/auth/signin",
  userImage,
  teamImage = "https://assets.alpadev.xyz/assets/logo.jpg",
}: TeamInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join {teamName} on Alpadev</Preview>
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
        <Body
          className="font-sans bg-black text-white"
          style={{ backgroundColor: "#000000", color: "#ffffff" }}
        >
          <Container
            className="mx-auto px-4 py-5"
            style={{ backgroundColor: "#000000" }}
          >
            <Section className="mt-8">
              <Link href="https://alpadev.xyz">
                <Img
                  src={teamImage}
                  width="50"
                  height="50"
                  alt={`${teamName} Logo`}
                  className="rounded-full"
                />
              </Link>
            </Section>

            {userImage ? (
              <Section className="mt-4">
                <Img
                  src={userImage}
                  width="64"
                  height="64"
                  alt={username}
                  className="rounded-full"
                />
              </Section>
            ) : null}

            <Section className="mt-8">
              <Text className="text-xl font-bold leading-tight text-white">
                Welcome to {teamName}
              </Text>
            </Section>

            <Section className="mt-2">
              <Text className="text-base text-gray-300">Hello {username},</Text>
              <Text className="text-base text-gray-300">
                You've been invited to join{" "}
                <span className="font-bold text-white">{teamName}</span> on
                Alpadev. Accept the invitation below to get started.
              </Text>
            </Section>

            <Section className="mt-8 text-center">
              <Button
                className="mx-auto flex w-fit items-center justify-center rounded-[8px] bg-white px-[24px] py-[12px] text-center text-[14px] font-semibold text-black hover:bg-gray-200"
                href={inviteLink}
              >
                Accept Invitation →
              </Button>
            </Section>

            <Section className="mt-4">
              <Text className="text-base text-gray-400">
                New to Alpadev?{" "}
                <Link
                  href="https://alpadev.xyz"
                  className="text-white underline"
                >
                  Learn more
                </Link>{" "}
                about the platform.
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
  )
}
