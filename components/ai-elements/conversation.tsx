"use client";

import {
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowDown, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

type ConversationContextValue = {
  contentRef: React.RefObject<HTMLDivElement | null>;
  isAtBottom: boolean;
  scrollToBottom: (smooth?: boolean) => void;
};

const ConversationContext = createContext<ConversationContextValue | null>(null);

function useConversationContext() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("Conversation components must be used within <Conversation>.");
  }
  return context;
}

export function Conversation({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = (smooth = true) => {
    const node = contentRef.current;
    if (!node) return;

    node.scrollTo({
      top: node.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const updateBottomState = () => {
      const threshold = 16;
      const distanceFromBottom = node.scrollHeight - node.scrollTop - node.clientHeight;
      setIsAtBottom(distanceFromBottom <= threshold);
    };

    updateBottomState();
    node.addEventListener("scroll", updateBottomState);
    return () => node.removeEventListener("scroll", updateBottomState);
  }, []);

  const contextValue = useMemo(
    () => ({ contentRef, isAtBottom, scrollToBottom }),
    [isAtBottom]
  );

  return (
    <ConversationContext.Provider value={contextValue}>
      <div className={cn("relative flex h-full flex-col", className)} {...props}>
        {children}
      </div>
    </ConversationContext.Provider>
  );
}

export function ConversationContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { contentRef, isAtBottom, scrollToBottom } = useConversationContext();

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom(false);
    }
  }, [children, isAtBottom, scrollToBottom]);

  return (
    <div
      ref={contentRef}
      className={cn("flex-1 space-y-3 overflow-y-auto px-4 py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface ConversationEmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: ReactNode;
}

export function ConversationEmptyState({
  title,
  description,
  icon,
  className,
  ...props
}: ConversationEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center",
        className
      )}
      {...props}
    >
      <div className="mb-3 text-slate-300">{icon ?? <MessageSquare className="h-10 w-10" />}</div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

export function ConversationScrollButton({ className, ...props }: HTMLAttributes<HTMLButtonElement>) {
  const { isAtBottom, scrollToBottom } = useConversationContext();

  if (isAtBottom) return null;

  return (
    <button
      type="button"
      onClick={() => scrollToBottom(true)}
      className={cn(
        "absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50",
        className
      )}
      aria-label="Scroll to latest message"
      {...props}
    >
      <ArrowDown className="h-4 w-4" />
    </button>
  );
}
