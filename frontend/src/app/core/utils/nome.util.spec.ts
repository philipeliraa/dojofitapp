import { iniciaisDoNome } from './nome.util';

describe('iniciaisDoNome', () => {
  it('extrai a primeira letra de até dois nomes', () => {
    expect(iniciaisDoNome('Philipe Lira')).toBe('PL');
  });

  it('usa só uma letra quando há um único nome', () => {
    expect(iniciaisDoNome('Philipe')).toBe('P');
  });

  it('ignora nomes com mais de duas palavras além das duas primeiras', () => {
    expect(iniciaisDoNome('Philipe Elias Lira')).toBe('PE');
  });

  it('ignora espaços extras entre palavras', () => {
    expect(iniciaisDoNome('Philipe   Lira')).toBe('PL');
  });

  it('retorna null para nome vazio, nulo ou indefinido', () => {
    expect(iniciaisDoNome('')).toBeNull();
    expect(iniciaisDoNome('   ')).toBeNull();
    expect(iniciaisDoNome(null)).toBeNull();
    expect(iniciaisDoNome(undefined)).toBeNull();
  });
});
