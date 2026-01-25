"use client";

import React from "react";
import {Button as NextUIButton, Tooltip as NextUITooltip} from "@heroui/react";
const Button = NextUIButton as any;
const Tooltip = NextUITooltip as any;
import {Icon} from "@iconify/react";
import {cn} from "@heroui/react";

import PromptInput from "./PromptInput";

export default function PromptInputWithActions({ onSubmit }: { onSubmit?: (value: string) => void }) {
  const [prompt, setPrompt] = React.useState<string>("");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim()) return;
    onSubmit?.(prompt);
    setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
      <form 
        onSubmit={handleSubmit}
        className="rounded-medium bg-white/5 backdrop-blur-md border border-white/10 flex w-full flex-col items-start transition-colors hover:bg-white/10 max-w-3xl"
      >
        <PromptInput
          classNames={{
            inputWrapper: "bg-transparent! shadow-none",
            innerWrapper: "relative",
            input: "pt-4 pl-4 pb-6 pr-10! text-medium text-white placeholder:text-white/50",
          }}
          endContent={
            <div className="flex items-end gap-2 p-2">
              <Tooltip showArrow content="Send message">
                <Button
                  isIconOnly
                  onPress={() => handleSubmit()}
                  color={!prompt ? "default" : "primary"}
                  isDisabled={!prompt}
                  radius="lg"
                  size="sm"
                  variant="solid"
                  className={cn( !prompt ? "bg-white/10" : "bg-primary")}
                >
                  <Icon
                    className={cn(
                      "[&>path]:stroke-[2px]",
                      !prompt ? "text-default-600" : "text-primary-foreground",
                    )}
                    icon="solar:arrow-up-linear"
                    width={20}
                  />
                </Button>
              </Tooltip>
            </div>
          }
          minRows={3}
          radius="lg"
          value={prompt}
          variant="flat"
          onValueChange={setPrompt}
          onKeyDown={handleKeyDown}
        />
        <div className="flex w-full items-center justify-between gap-2 overflow-auto px-4 pb-4">
          <div className="flex w-full gap-1 md:gap-3">
            <Button
              size="sm"
              startContent={
                <Icon className="text-white/60" icon="solar:paperclip-linear" width={18} />
              }
              variant="flat"
              className="bg-white/5 text-white/80 hover:bg-white/10"
            >
              Attach
            </Button>
            <Button
              size="sm"
              startContent={
                <Icon className="text-white/60" icon="solar:soundwave-linear" width={18} />
              }
              variant="flat"
              className="bg-white/5 text-white/80 hover:bg-white/10"
            >
              Voice
            </Button>
            <Button
              size="sm"
              startContent={
                <Icon className="text-white/60" icon="solar:notes-linear" width={18} />
              }
              variant="flat"
              className="bg-white/5 text-white/80 hover:bg-white/10"
            >
              Templates
            </Button>
          </div>
          <p className="text-tiny text-white/40 py-1">{prompt.length}/2000</p>
        </div>
      </form>
  );
}
