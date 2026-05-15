"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { TransactionModal } from "@/components/dashboard/TransactionModal";
import { AllowanceModal } from "@/components/dashboard/AllowanceModal";
import { QuickDeductModal } from "@/components/dashboard/QuickDeductModal";
import NewGoalModal from "@/components/savings/NewGoalModal";
import { Allowance, useFinanceStore } from "@/lib/store";

interface ModalContextType {
  openTransactionModal: () => void;
  closeTransactionModal: () => void;
  openAllowanceModal: (allowance?: Allowance) => void;
  closeAllowanceModal: () => void;
  openQuickDeductModal: (allowance: Allowance) => void;
  closeQuickDeductModal: () => void;
  openNewGoalModal: () => void;
  closeNewGoalModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAllowanceModalOpen, setIsAllowanceModalOpen] = useState(false);
  const [isQuickDeductModalOpen, setIsQuickDeductModalOpen] = useState(false);
  const [selectedAllowance, setSelectedAllowance] = useState<Allowance | null>(null);

  const openTransactionModal = () => setIsTransactionModalOpen(true);
  const closeTransactionModal = () => setIsTransactionModalOpen(false);

  const openAllowanceModal = (allowance?: Allowance) => {
    setSelectedAllowance(allowance || null);
    setIsAllowanceModalOpen(true);
  };
  const closeAllowanceModal = () => {
    setIsAllowanceModalOpen(false);
    setSelectedAllowance(null);
  };

  const { isNewGoalModalOpen, setNewGoalModalOpen } = useFinanceStore();
  const openNewGoalModal = () => setNewGoalModalOpen(true);
  const closeNewGoalModal = () => setNewGoalModalOpen(false);

  const openQuickDeductModal = (allowance: Allowance) => {
    setSelectedAllowance(allowance);
    setIsQuickDeductModalOpen(true);
  };
  const closeQuickDeductModal = () => {
    setIsQuickDeductModalOpen(false);
    setSelectedAllowance(null);
  };

  return (
    <ModalContext.Provider value={{ 
      openTransactionModal, 
      closeTransactionModal,
      openAllowanceModal,
      closeAllowanceModal,
      openQuickDeductModal,
      closeQuickDeductModal,
      openNewGoalModal,
      closeNewGoalModal
    }}>
      {children}
      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={closeTransactionModal} 
      />
      <AllowanceModal 
        isOpen={isAllowanceModalOpen} 
        onClose={closeAllowanceModal} 
        allowanceToEdit={selectedAllowance || undefined}
      />
      <QuickDeductModal
        isOpen={isQuickDeductModalOpen}
        onClose={closeQuickDeductModal}
        allowance={selectedAllowance}
        onOpenSettings={(al) => {
          closeQuickDeductModal();
          openAllowanceModal(al);
        }}
      />
      <NewGoalModal 
        isOpen={isNewGoalModalOpen}
        onClose={closeNewGoalModal}
      />
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return context;
}
