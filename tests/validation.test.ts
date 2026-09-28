import { describe, it, expect } from 'vitest';
import { validateLead, validateStep1, sanitize, MAX_LENGTHS } from '@/lib/validation';

const validLead = {
  services: ['oil-change'],
  symptom: '',
  car: 'Toyota Camry',
  year: '2015',
  timeSlot: 'morning',
  date: 'tomorrow',
  name: 'Алмас',
  phone: '+77770884436',
  comment: '',
  source: 'hero_cta',
  locale: 'ru',
  company: '',
};

describe('validateLead', () => {
  it('принимает корректную заявку', () => {
    const result = validateLead(validLead);
    expect(result.success).toBe(true);
  });

  it('нормализует телефон к +7XXXXXXXXXX', () => {
    const result = validateLead({ ...validLead, phone: '8 (777) 088-44-36' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBe('+77770884436');
  });

  it('отклоняет пустой список услуг', () => {
    const result = validateLead({ ...validLead, services: [] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.services).toBeTruthy();
  });

  it('ограничивает количество услуг четырьмя', () => {
    const result = validateLead({
      ...validLead,
      services: ['a', 'b', 'c', 'd', 'e'],
    });
    expect(result.success).toBe(false);
  });

  it('требует непустое имя', () => {
    const result = validateLead({ ...validLead, name: 'A' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.name).toBeTruthy();
  });

  it('отклоняет телефон с неверной длиной', () => {
    const result = validateLead({ ...validLead, phone: '+777' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.phone).toBeTruthy();
  });

  it('отклоняет номер не из Казахстана', () => {
    const result = validateLead({ ...validLead, phone: '+79991234567' });
    expect(result.success).toBe(false);
  });

  it('требует марку автомобиля от 2 символов', () => {
    const result = validateLead({ ...validLead, car: 'T' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.car).toBeTruthy();
  });

  it('обрезает слишком длинные поля', () => {
    const result = validateLead({ ...validLead, symptom: 'я'.repeat(400) });
    expect(result.success).toBe(false);
  });

  it('ловит honeypot: непустое поле company', () => {
    const result = validateLead({ ...validLead, company: 'spam' });
    expect(result.success).toBe(false);
  });

  it('санитизирует строку: убирает управляющие символы', () => {
    const result = validateLead({ ...validLead, name: 'Ал\u0000ма\u0007с' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Ал ма с');
  });

  it('не ломается на некорректном типе', () => {
    expect(validateLead(null).success).toBe(false);
    expect(validateLead('строка').success).toBe(false);
    expect(validateLead({}).success).toBe(false);
  });

  it('разрешает 300 символов в симптоме', () => {
    const result = validateLead({ ...validLead, symptom: 'я'.repeat(MAX_LENGTHS.symptom) });
    expect(result.success).toBe(true);
  });
});

describe('validateStep1', () => {
  it('пропускает, если выбрана хотя бы одна услуга', () => {
    expect(validateStep1(['oil-change'], '')).toBeNull();
  });

  it('пропускает, если симптом от 5 символов', () => {
    expect(validateStep1([], 'стук в подвеске')).toBeNull();
  });

  it('требует услугу или достаточно длинный симптом', () => {
    expect(validateStep1([], 'стук')).toBeTruthy();
    expect(validateStep1([], '')).toBeTruthy();
  });
});

describe('sanitize', () => {
  it('убирает лишние пробелы по краям', () => {
    expect(sanitize('  Алмас  ')).toBe('Алмас');
  });

  it('заменяет управляющие символы пробелом (чтобы не склеивать слова)', () => {
    expect(sanitize('Ал\u0000ма\u0007с')).toBe('Ал ма с');
  });

  it('обрезает строку до нормализованного вида', () => {
    expect(sanitize('  \u0007  Алмас  \u0000 ')).toBe('Алмас');
  });
});
