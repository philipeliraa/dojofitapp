/**
 * Formata a data no fuso LOCAL (YYYY-MM-DD) — nunca `toISOString()`, que
 * converte para UTC e erra o dia em qualquer fuso atrás de UTC durante a
 * noite (ex: 22h em UTC-3 já é o dia seguinte em UTC). Check-in só vale
 * no dia da própria aula (docs/01), então esse erro bloqueava check-ins
 * legítimos justamente no horário de pico das aulas.
 */
export function formatDateLocal(d: Date): string {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
