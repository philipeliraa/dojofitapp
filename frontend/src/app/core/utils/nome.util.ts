/** Iniciais do nome para fallback de avatar (docs/04 — dojofit-avatar). */
export function iniciaisDoNome(nome: string | null | undefined): string | null {
  if (!nome?.trim()) return null;
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(parte => parte[0]?.toUpperCase())
    .join('');
}
