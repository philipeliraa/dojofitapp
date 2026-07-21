package com.dojofit.api.model.enums;

/**
 * Estado de uma técnica para um aluno (docs/01, docs/09 §6). Dois estados,
 * conforme docs/01: "técnicas dominadas e técnicas em desenvolvimento".
 * A ausência de registro significa técnica ainda não iniciada.
 */
public enum StatusTecnica {
    EM_DESENVOLVIMENTO, DOMINADA
}
