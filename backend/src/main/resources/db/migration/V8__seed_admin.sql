-- Default admin user: admin@dojofit.com / admin123
-- BCrypt hash of "admin123"
INSERT INTO usuario (nome, email, senha_hash, role, ativo)
VALUES ('Admin DojoFit', 'admin@dojofit.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', true);
