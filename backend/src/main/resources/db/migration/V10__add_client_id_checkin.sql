-- Idempotência de check-in (docs/07 seção 6, docs/08 seção 4):
-- todo check-in carrega um UUID gerado no cliente; o backend deduplica por ele.
ALTER TABLE checkin ADD COLUMN client_id UUID;

-- Registros existentes (anteriores à regra) recebem um UUID gerado no banco.
UPDATE checkin SET client_id = gen_random_uuid() WHERE client_id IS NULL;

ALTER TABLE checkin ALTER COLUMN client_id SET NOT NULL;
ALTER TABLE checkin ADD CONSTRAINT uk_checkin_client_id UNIQUE (client_id);
