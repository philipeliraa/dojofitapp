import { formatDateLocal } from './data.util';

describe('formatDateLocal', () => {
  it('formata ano-mes-dia com zero à esquerda', () => {
    expect(formatDateLocal(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('usa a data LOCAL, não UTC — 22h em UTC-3 não pode virar o dia seguinte', () => {
    // 17/07 às 23h locais: toISOString() converteria para UTC e daria 18/07
    const noite = new Date(2026, 6, 17, 23, 0, 0);
    expect(formatDateLocal(noite)).toBe('2026-07-17');
  });

  it('funciona também logo após a meia-noite', () => {
    const meiaNoite = new Date(2026, 6, 18, 0, 5, 0);
    expect(formatDateLocal(meiaNoite)).toBe('2026-07-18');
  });
});
