import type { Service } from '@/content/services';
import type { ServiceView, OtherService } from '@/components/sections/serviceView';

/**
 * Преобразует услугу из content/services.ts в сериализуемый вид для
 * клиентского компонента (иконку передать нельзя — это функция).
 */
export function toServiceView(service: Service): ServiceView {
  return {
    id: service.id,
    index: service.index,
    title: service.title,
    short: service.short,
    slug: service.slug,
  };
}

/** Список «других услуг» для страницы услуги. */
export function toOtherServices(list: Service[], currentSlug: string): OtherService[] {
  return list
    .filter((s) => s.slug !== null && s.slug !== currentSlug)
    .slice(0, 5)
    .map((s) => ({ id: s.id, title: s.title, slug: s.slug }));
}
