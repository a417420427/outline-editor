import React, {
  createContext,
  useState,
  type ReactNode,
  type ReactElement,
  useRef,
} from "react";
import { createPortal } from "react-dom";

// Type for modal content
type ModalContent = {
  id: number;
  component: ReactElement<{ onClose: () => void }>;
  resolver: (value: void) => void;
};

// Context value type
export type ModalContextType = {
  modals: ModalContent[];
  openModal: (
    component: ReactElement<{ onClose: () => void }>
  ) => {
    id: number;
    close: () => void;
    promise: Promise<void>;
  };
  closeModal: (id: number, result?: void) => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const ModalContext = createContext<ModalContextType | null>(null);

// Modal Provider
export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [modals, setModals] = useState<ModalContent[]>([]);
  const idRef = useRef(0);

  const openModal = (
    component: ReactElement<{ onClose: () => void }>
  ): { id: number; close: () => void; promise: Promise<void> } => {
    let resolver: (value: void) => void = () => {};
    const promise = new Promise<void>((resolve) => {
      resolver = resolve;
    });

    idRef.current += 1;
    const newId = idRef.current;

    const wrappedComponent = React.cloneElement(component, {
      onClose: () => closeModal(newId),
    });

    setModals((prev) => [
      ...prev,
      { id: newId, component: wrappedComponent, resolver },
    ]);

    return {
      id: newId,
      close: () => closeModal(newId),
      promise,
    };
  };

  const closeModal = (id: number, result?: void) => {
    setModals((prev) => {
      const modal = prev.find((m) => m.id === id);
      if (modal) {
        // Call resolver after removing from state to prevent multiple calls
        setTimeout(() => modal.resolver(result), 0);
      }
      return prev.filter((m) => m.id !== id);
    });
  };

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal }}>
      {children}
      {modals.map(({ id, component }) =>
        createPortal(
          <div
            key={id}
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          >
            {component}
          </div>,
          document.body
        )
      )}
    </ModalContext.Provider>
  );
};
