package org.example.backend.dto

import java.io.Serializable

data class CrearCombateDto(
    val id: Long? = null,
    val nombre: String,
    val jugador1: JugadorDto,
    val jugador2: JugadorDto,
    val juegoId: Long,
): Serializable {
    data class JugadorDto(
        val id: Long? = null,
        val usuarioId: Long? = null,
        val rol: String,
        val personajeId: Long
    ): Serializable
}
