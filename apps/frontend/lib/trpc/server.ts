import { unstable_cache as cache } from 'next/cache'
import { createCaller, createTRPCContext } from "@package/api"
import { headers } from "next/headers"

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const incomingHeaders = await headers();
  const heads = new Headers();

  incomingHeaders.forEach((value, key) => {
    heads.append(key, value);
  });

  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({ headers: heads });
});

export const api = createCaller(createContext)
