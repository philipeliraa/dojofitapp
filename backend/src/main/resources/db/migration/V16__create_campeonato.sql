-- Campeonatos e medalhas (docs/09 §7, Fase 3c): participação do aluno como
-- evento na linha do tempo permanente (docs/01). Registro por aluno, feito pela
-- equipe. Sem seed — eventos são reais, inseridos pela academia.
CREATE TABLE campeonato (
    id                BIGSERIAL PRIMARY KEY,
    aluno_id          BIGINT NOT NULL REFERENCES usuario(id),
    nome              VARCHAR(150) NOT NULL,
    data              DATE NOT NULL,
    resultado         VARCHAR(20) NOT NULL,
    categoria         VARCHAR(100),
    observacao        TEXT,
    registrado_por_id BIGINT NOT NULL REFERENCES usuario(id),
    criado_em         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campeonato_aluno ON campeonato(aluno_id, data DESC);
