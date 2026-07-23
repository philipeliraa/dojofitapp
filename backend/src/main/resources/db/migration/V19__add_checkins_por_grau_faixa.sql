-- Meta indicativa de check-ins por grau (spec tela-inicio §3): fonte da verdade
-- da barra de progresso do card de identidade. A academia/professor define por
-- faixa; ao ser atingida NÃO promove ninguém — a promoção é sempre decisão
-- manual do professor (spec §3). A edição da meta é de outro módulo (spec §7),
-- aqui só criamos a coluna com um valor inicial uniforme, ajustável depois.
ALTER TABLE faixa ADD COLUMN checkins_por_grau INT NOT NULL DEFAULT 40;
