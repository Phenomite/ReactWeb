import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

interface HeaderSlotContextType {
  customTitle: ReactNode | null;
  customActions: ReactNode | null;
  setHeaderSlot: (slot: { title?: ReactNode; actions?: ReactNode } | null) => void;
}

const HeaderSlotContext = createContext<HeaderSlotContextType | undefined>(undefined);

// Manages dynamic view-specific header titles and action buttons
export function HeaderSlotProvider({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<{ title?: ReactNode; actions?: ReactNode } | null>(null);

  const contextValue = useMemo<HeaderSlotContextType>(
    () => ({
      customTitle: slot?.title ?? null,
      customActions: slot?.actions ?? null,
      setHeaderSlot: setSlot,
    }),
    [slot]
  );

  return <HeaderSlotContext.Provider value={contextValue}>{children}</HeaderSlotContext.Provider>;
}

// Hook to access or customize the top header title and action slots
export function useHeaderSlot(): HeaderSlotContextType {
  const context = useContext(HeaderSlotContext);
  if (!context) {
    throw new Error('useHeaderSlot must be used within a HeaderSlotProvider');
  }
  return context;
}

