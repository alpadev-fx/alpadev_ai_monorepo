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
  url: string
}

export default function MagicLinkSignIn({ email, url }: TrialEndingSoonProps) {
  return (
    <Html>
      <Head />
      <Preview>Magic Link Sign In/Register</Preview>
      <Tailwind>
        <Body className="m-auto bg-white font-sans">
          <Container className="my-10 flex max-w-[500px] rounded border border-solid border-gray-200 px-10 py-5">
            <Text className="text-2xl font-extrabold">
              Magic Link Sign In/Register
            </Text>
            <Text className="text-sm leading-6 text-black">Dear user,</Text>
            <Text className="text-sm leading-6 text-black">
              Click and confirm that you want to sign in to Acme.
            </Text>
            <Link
              className="mt-4 inline-block cursor-pointer rounded bg-green-600 px-4 py-2 text-white"
              href={url}
            >
              Sign In/Sign Up
            </Link>
            <Text className="text-sm leading-6 text-black">
              Or sign in/sign up using this link:
            </Text>
            <Link className="mt-4 text-sm leading-6 text-black" href={url}>
              {url}
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
