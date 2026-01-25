
import {
  Body,
  Container,
  Head,
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

export default function InvoicePaymentFailed({
  email,
  portalUrl,
}: TrialEndingSoonProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Acme Free Trial is about to expire</Preview>
      <Tailwind>
        <Body className="m-auto bg-white font-sans">
          <Container className="my-10 flex max-w-[500px] rounded border border-solid border-gray-200 px-10 py-5">
            <Text className="text-2xl font-extrabold">
              Oh no, your payment failed
            </Text>
            <Text className="text-sm leading-6 text-black">
              To keep your subscription you may need to update your payments
              details.
            </Text>
            <Link
              className="mt-4 inline-block cursor-pointer rounded bg-green-600 px-4 py-2 text-white"
              href={portalUrl}
            >
              UPDATE DETAILS
            </Link>
            <Text className="text-sm leading-6 text-black">
              Let us know if you have any questions or feedback. I&apos;m always
              happy to help!
            </Text>
            <Text className="text-sm font-light leading-6 text-gray-400">
              Your friends at Acme
            </Text>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
