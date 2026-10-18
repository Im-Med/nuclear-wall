'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { ModeScope } from '@/lib/nuclear-types'

export type ModalState =
  | { type: 'pin'; title: string; description?: string; onConfirm: () => void }
  | {
      type: 'confirm'
      title: string
      description: string
      confirmLabel: string
      onConfirm: () => void
    }
  | { type: 'new-preset' }
  | { type: 'new-mode'; scope: ModeScope }
  | { type: 'mode-editor'; scope: ModeScope; modeId: string }
  | { type: 'schedule-lock' }

interface ModalContextType {
  modal: ModalState | null
  openModal: (m: ModalState) => void
  closeModal: () => void
  /** Asks for the admin PIN, then opens the editor for an existing mode. */
  openModeEditor: (scope: ModeScope, modeId: string, modeName: string) => void
}

const ModalContext = createContext<ModalContextType>({
  modal: null,
  openModal: () => {},
  closeModal: () => {},
  openModeEditor: () => {},
})

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null)
  const openModal = useCallback((m: ModalState) => setModal(m), [])
  const closeModal = useCallback(() => setModal(null), [])
  const openModeEditor = useCallback((scope: ModeScope, modeId: string, modeName: string) => {
    setModal({
      type: 'pin',
      title: `Edit ${modeName}`,
      description: 'Enter your admin PIN to edit this mode.',
      onConfirm: () => setModal({ type: 'mode-editor', scope, modeId }),
    })
  }, [])

  return (
    <ModalContext.Provider value={{ modal, openModal, closeModal, openModeEditor }}>
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = () => useContext(ModalContext)
