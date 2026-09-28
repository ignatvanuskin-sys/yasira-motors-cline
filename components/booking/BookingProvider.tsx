'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/**
 * Состояние системы записи — раздел 13.
 *
 * Данные живут в памяти (React state) и НЕ сохраняются в localStorage:
 * это персональные данные, и оставлять их в браузере не нужно.
 * При закрытии листа на середине состояние сохраняется до перезагрузки.
 */

export type BookingStatus = 'idle' | 'sending' | 'success' | 'error';

export type BookingState = {
  /** Выбранные услуги (id из content/services). */
  services: string[];
  /** Описание симптома, до 300 символов. */
  symptom: string;
  /** Марка и модель. */
  car: string;
  year: string;
  /** Выбранный слот времени (id). */
  timeSlot: string;
  /** Выбранный день: 'today' | 'tomorrow' | конкретная дата YYYY-MM-DD. */
  day: string;
  name: string;
  phone: string;
  comment: string;
  /** Откуда открыли запись — для аналитики и сообщения в Telegram. */
  source: string;
  status: BookingStatus;
  /** Текст ошибки, если status === 'error'. */
  error: string;
};

const initialState: BookingState = {
  services: [],
  symptom: '',
  car: '',
  year: '',
  timeSlot: '',
  day: '',
  name: '',
  phone: '',
  comment: '',
  source: 'unknown',
  status: 'idle',
  error: '',
};

export type BookingContextValue = {
  isOpen: boolean;
  step: 1 | 2 | 3;
  state: BookingState;
  /** Открыть запись. serviceId — предвыбранная услуга. */
  open: (serviceId?: string, source?: string) => void;
  close: () => void;
  goToStep: (step: 1 | 2 | 3) => void;
  update: (patch: Partial<BookingState>) => void;
  toggleService: (serviceId: string) => void;
  reset: () => void;
  setStatus: (status: BookingStatus, error?: string) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

/** Максимум услуг в шаге 1 (раздел 13). */
export const MAX_SERVICES = 4;

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [state, setState] = useState<BookingState>(initialState);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const open = useCallback(
    (serviceId?: string, source = 'unknown') => {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      setState((prev) => ({
        ...prev,
        // Предвыбор услуги: добавляем, сохраняя остальные выборы.
        services:
          serviceId && !prev.services.includes(serviceId)
            ? [...prev.services, serviceId].slice(0, MAX_SERVICES)
            : prev.services,
        source,
        status: 'idle',
        error: '',
      }));
      setStep(1);
      setIsOpen(true);
    },
    [],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    // Возврат фокуса на элемент-триггер (раздел 20).
    requestAnimationFrame(() => returnFocusRef.current?.focus?.());
  }, []);

  const update = useCallback((patch: Partial<BookingState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleService = useCallback((serviceId: string) => {
    setState((prev) => {
      const has = prev.services.includes(serviceId);
      if (has) return { ...prev, services: prev.services.filter((s) => s !== serviceId) };
      if (prev.services.length >= MAX_SERVICES) return prev;
      return { ...prev, services: [...prev.services, serviceId] };
    });
  }, []);

  const reset = useCallback(() => setState(initialState), []);
  const setStatus = useCallback(
    (status: BookingStatus, error = '') => setState((prev) => ({ ...prev, status, error })),
    [],
  );

  const value = useMemo<BookingContextValue>(
    () => ({
      isOpen,
      step,
      state,
      open,
      close,
      goToStep: setStep,
      update,
      toggleService,
      reset,
      setStatus,
    }),
    [isOpen, step, state, open, close, update, toggleService, reset, setStatus],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking должен использоваться внутри BookingProvider');
  return ctx;
}
