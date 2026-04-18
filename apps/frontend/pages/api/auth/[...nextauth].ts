import { authOptions } from "@package/auth"
import NextAuth from "next-auth"

// @ts-expect-error — pnpm installs two next-auth@4.24.11 copies (react@18 vs @react-three/fiber's react@19 peer). Types differ; runtime is same package.
export default NextAuth(authOptions)
