/**
 * Команда — раздел 10.7.
 *
 * ⚑ В отзывах клиенты хвалят по имени: администратора Руслана, мастера Ислама
 * (развал-схождение), автоэлектрика Нурлыбека, консультанта по маслам Жиенғали.
 *
 * ПУБЛИКОВАТЬ ИМЕНА МОЖНО ТОЛЬКО С ПИСЬМЕННОГО СОГЛАСИЯ КАЖДОГО СОТРУДНИКА.
 * Пока массив пуст — блок «Команда» вообще не рендерится на сайте.
 * См. OWNER_CHECKLIST.md.
 */

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  /** Согласие сотрудника на публикацию имени. */
  consentGiven: boolean;
};

export const team: TeamMember[] = [];

export const visibleTeam = team.filter((m) => m.consentGiven);

export const hasTeam = visibleTeam.length > 0;
