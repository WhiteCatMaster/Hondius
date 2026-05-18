package org.example.backend.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.PrePersist
import jakarta.persistence.PreUpdate
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint

@Entity
@Table(
    name = "turnos",
    uniqueConstraints = [
        UniqueConstraint(name = "uk_turno_combate_numero", columnNames = ["combate_id", "numero_turno"]),
    ],
)
class Turno(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(name = "numero_turno", nullable = false)
    var numeroTurno: Int,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "combate_id", nullable = false)
    var combate: Combate,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jugador1_id", nullable = false)
    var jugador1: JugadorJuego,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jugador2_id", nullable = false)
    var jugador2: JugadorJuego,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_turno_id", nullable = false)
    var ownerTurno: JugadorJuego,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ataque_id", nullable = false)
    var ataque: Ataque,
) {
    @PrePersist
    @PreUpdate
    fun validarIntegridad() {
        require(numeroTurno >= 1) { "numeroTurno debe ser mayor o igual a 1" }
        val jugadoresDistintos =
            if (jugador1.id != null && jugador2.id != null) jugador1.id != jugador2.id else jugador1 !== jugador2
        require(jugadoresDistintos) { "jugador1 y jugador2 no pueden ser el mismo" }

        val ownerEsJugador1 =
            if (ownerTurno.id != null && jugador1.id != null) ownerTurno.id == jugador1.id else ownerTurno === jugador1
        val ownerEsJugador2 =
            if (ownerTurno.id != null && jugador2.id != null) ownerTurno.id == jugador2.id else ownerTurno === jugador2

        require(ownerEsJugador1 || ownerEsJugador2) {
            "ownerTurno debe ser jugador1 o jugador2"
        }
    }
}