export type Role = 'ALUNO' | 'PROFESSOR' | 'ADMIN';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: Role;
  ativo: boolean;
  criadoEm: string;
  /** Nome da academia (tenant) do usuário — contexto exibido no Início. */
  academiaNome?: string;
}
