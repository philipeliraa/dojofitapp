-- Fix admin password hash to match "admin123"
UPDATE usuario SET senha_hash = '$2b$10$QIjwC1xkBj1SrDNLW.h7zuRm9hKVBi43uKTM.XnZE5Q8U93axO/DG' WHERE email = 'admin@dojofit.com';
