"use client"

interface PlayStoreLinkProps {
  color?: string
}

export function PlayStoreLink({ color = "black" }: PlayStoreLinkProps) {
  return (
    <a
      className="inline-flex items-center gap-2 rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white hover:bg-gray-800 transition-colors duration-200"
      href="#"
      rel="noopener noreferrer"
      target="_blank"
    >
      <svg
        className="h-8 w-8"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626c.547.316.547 1.112 0 1.428l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" />
      </svg>
      <div className="text-left">
        <div className="text-xs">GET IT ON</div>
        <div className="text-lg font-semibold -mt-1">Google Play</div>
      </div>
    </a>
  )
}
