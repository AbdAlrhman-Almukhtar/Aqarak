import { createContext, useContext, useState, type ReactNode } from 'react';

interface ChatContextType {
  isOpen: boolean;
  initialMessage: string | null;
  propertyId: number | null;
  openChat: (message?: string, propertyId?: number) => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState<number | null>(null);

  const openChat = (message?: string, propId?: number) => {
    if (message) setInitialMessage(message);
    if (propId) setPropertyId(propId);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setInitialMessage(null);
    setPropertyId(null);
  };

  const toggleChat = () => setIsOpen(prev => !prev);

  return (
    <ChatContext.Provider value={{ isOpen, initialMessage, propertyId, openChat, closeChat, toggleChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
