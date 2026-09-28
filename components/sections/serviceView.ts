/**
 * Типы для передачи данных услуги из серверного компонента в клиентский.
 * Иконка (функция) через границу RSC не проходит, поэтому в представление
 * входят только сериализуемые поля.
 */
export type ServiceView = {
  id: string;
  index: number;
  title: string;
  short: string;
  slug: string | null;
};

export type OtherService = { id: string; title: string; slug: string | null };
