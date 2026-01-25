"use client"

import { Card, CardBody, Avatar } from "@heroui/react"
import { Icon } from "@iconify/react"

type UserReviewProps = {
  photoSrc: string
  author: string
  location: string
  countryCode: string
  quote: string
}

export default function UserReview({
  photoSrc,
  author,
  location,
  countryCode,
  quote,
}: UserReviewProps) {
  return (
    <Card className="mb-4 bg-gray-900/50 border border-gray-800 hover:border-indigo-500/30 transition-colors duration-300">
      <CardBody className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="flex-shrink-0" size="md" src={photoSrc} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">{author}</p>
              <p className="text-gray-400 text-xs flex items-center gap-1">
                <Icon
                  className="inline-block"
                  height={14}
                  icon={`flag:${countryCode}-4x3`}
                  width={18}
                />
                {location}
              </p>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            &ldquo;{quote}&rdquo;
          </p>
        </div>
      </CardBody>
    </Card>
  )
}
