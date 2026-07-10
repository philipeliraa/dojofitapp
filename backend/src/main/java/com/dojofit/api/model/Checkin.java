package com.dojofit.api.model;

import com.dojofit.api.model.enums.StatusCheckin;
import com.dojofit.api.model.enums.TipoCheckin;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "checkin", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"aula_id", "aluno_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class Checkin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aula_id", nullable = false)
    private Aula aula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Usuario aluno;

    @Column(name = "data_hora_checkin", nullable = false)
    private LocalDateTime dataHoraCheckin = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoCheckin tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusCheckin status;
}
