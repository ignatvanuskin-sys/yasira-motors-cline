import type { LucideIcon } from 'lucide-react';
import {
  Droplets,
  ScanLine,
  Cog,
  Compass,
  Zap,
  Settings2,
  Truck,
  CircleDot,
  Wrench,
} from 'lucide-react';

/**
 * Услуги в фиксированном порядке из раздела 10.3 мастер-промпта.
 * slug === null означает, что отдельной SEO-страницы у услуги нет
 * (карточка открывает только запись).
 */
export type Service = {
  id: string;
  slug: string | null;
  index: number;
  title: string;
  short: string;
  icon: LucideIcon;
  /** ⚑ Цены не подтверждены: вкладка «Цены» в 2ГИС не отображается. */
  priceFrom: number | null;
  priceNote: string;
  /** Эксклюзивный чип в шаге 1 записи. */
  bookingOnly?: boolean;
};

export const services: Service[] = [
  {
    id: 'oil-change',
    slug: 'zamena-masla',
    index: 1,
    title: 'Замена масла и фильтров',
    short: 'Двигатель, АКПП, редукторы. Подберём масло под допуск вашего авто.',
    icon: Droplets,
    priceFrom: null,
    priceNote: 'Цена после осмотра',
  },
  {
    id: 'diagnostics',
    slug: 'kompyuternaya-diagnostika',
    index: 2,
    title: 'Компьютерная диагностика',
    short: 'Считываем ошибки и находим причину, а не просто стираем код.',
    icon: ScanLine,
    priceFrom: null,
    priceNote: 'Цена после осмотра',
  },
  {
    id: 'suspension',
    slug: 'remont-hodovoi-chasti',
    index: 3,
    title: 'Ремонт ходовой части',
    short: 'Стуки, увод, вибрации: проверим подвеску и рулевое.',
    icon: Cog,
    priceFrom: null,
    priceNote: 'Цена после осмотра',
  },
  {
    id: 'alignment',
    slug: 'razval-shozhdenie',
    index: 4,
    title: 'Развал-схождение',
    short: 'Ровная езда и равномерный износ шин.',
    icon: Compass,
    priceFrom: null,
    priceNote: 'Цена после осмотра',
  },
  {
    id: 'electric',
    slug: 'avtoelektrik',
    index: 5,
    title: 'Автоэлектрик',
    short: 'Стартеры, генераторы, ошибки электроники и ABS.',
    icon: Zap,
    priceFrom: null,
    priceNote: 'Цена после осмотра',
  },
  {
    id: 'gearbox',
    slug: 'remont-akpp-mkpp',
    index: 6,
    title: 'АКПП и МКПП',
    short: 'Диагностика, ремонт, замена масла в коробке.',
    icon: Settings2,
    priceFrom: null,
    priceNote: 'Цена после осмотра',
  },
  {
    id: 'diesel',
    slug: null,
    index: 7,
    title: 'Дизельные двигатели',
    short: 'Обслуживание и ремонт дизельных моторов.',
    icon: Truck,
    priceFrom: null,
    priceNote: 'Цена после осмотра',
  },
  {
    id: 'tires',
    slug: null,
    index: 8,
    title: 'Шиномонтаж',
    short: 'Снятие, монтаж и установка колёс.',
    icon: CircleDot,
    priceFrom: null,
    priceNote: 'Цена после осмотра',
  },
];

/** Эксклюзивный пункт записи: клиент не знает, что сломалось. */
export const unknownIssueService: Service = {
  id: 'unknown',
  slug: null,
  index: 9,
  title: 'Не знаю, что сломалось',
  short: 'Опишите симптом — подскажем, с чего начать.',
  icon: Wrench,
  priceFrom: null,
  priceNote: '',
  bookingOnly: true,
};

export const allBookingOptions: Service[] = [...services, unknownIssueService];

/** Чипы быстрого выбора в hero (первые четыре по порядку). */
export const quickChips = services.slice(0, 4);

export function getServiceById(id: string): Service | undefined {
  return allBookingOptions.find((s) => s.id === id);
}

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export const serviceSlugs = services.filter((s) => s.slug !== null).map((s) => s.slug as string);

/** Бренды для чипов в шаге 2 — только подсказка ввода, список не заявляется как «мы работаем с…». */
export const brandChips = [
  'Toyota',
  'Lexus',
  'Hyundai',
  'Kia',
  'Chevrolet',
  'Nissan',
  'Mitsubishi',
  'Mazda',
  'Honda',
  'Volkswagen',
  'BMW',
  'Mercedes-Benz',
  'Ford',
  'Chery',
  'Haval',
  'Geely',
] as const;

/** Пресеты года выпуска для шага 2. */
export const carYears: string[] = Array.from({ length: 34 }, (_, i) => String(new Date().getFullYear() - i));
