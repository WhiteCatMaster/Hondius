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
        val usuario: UsuarioDto? = null,
        val rol: String,
        val personajeId: Long
    ): Serializable
    data class UsuarioDto(
        val id: Long? = null,
    ): Serializable
}
