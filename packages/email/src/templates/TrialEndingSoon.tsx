import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components"

import Footer from "./components/footer"

type TrialEndingSoonProps = {
  email: string
  portalUrl: string
}

export default function TrialEndingSoon({
  email,
  portalUrl,
}: TrialEndingSoonProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Alpadev Free Trial is about to expire</Preview>
      <Tailwind>
        <Body className="m-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[500px] rounded border border-solid border-gray-200 px-10 py-5">
            <Heading className="mx-0 my-7 p-0 text-center text-xl font-semibold text-black">
              Your trial is ending soon!
            </Heading>
            <Text className="text-sm leading-6 text-black">Hi there,</Text>
            <Text className="text-sm leading-6 text-black">
              We hope you&apos;ve been enjoying your Acme free trial.
            </Text>
            <Text className="text-sm leading-6 text-black">
              There are only 3 days left on your free trial for Acme. If you
              don&apos;t want to lose access to your account, you can subscribe
              to a plan by clicking the link below.
            </Text>
            <Link href={portalUrl}>Manage my subscriptions</Link>
            <Text>
              or visit your profile settings at{" "}
              <Link href={process.env.NEXT_PUBLIC_APP_URL + "/profile"}>
                {process.env.NEXT_PUBLIC_APP_URL + "/profile"}
              </Link>
            </Text>
            <Text className="text-sm leading-6 text-black">
              Let us know if you have any questions or feedback. I&apos;m always
              happy to help!
            </Text>
            <Text className="text-sm font-light leading-6 text-gray-400">
              Your friends at Alpadev
            </Text>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
