-- Academia (tenant): multi-tenancy deixa de ser só princípio arquitetural e
-- ganha uma entidade mínima (docs/01: multi-tenant-ready). Todo usuário pertence
-- a uma academia; o nome é o contexto de tenant exibido no Início
-- (spec tela-inicio §4), acima do card de identidade.
CREATE TABLE academia (
    id        BIGSERIAL PRIMARY KEY,
    nome      VARCHAR(120) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Academia inicial: os dados já existentes (admin seed, alunos) passam a
-- pertencer a ela. Novas academias entram por cadastro futuro, não hardcoded.
INSERT INTO academia (nome) VALUES ('Dojofit');

ALTER TABLE usuario ADD COLUMN academia_id BIGINT REFERENCES academia(id);
UPDATE usuario SET academia_id = (SELECT id FROM academia ORDER BY id LIMIT 1);
ALTER TABLE usuario ALTER COLUMN academia_id SET NOT NULL;

CREATE INDEX idx_usuario_academia ON usuario(academia_id);
