package org.example.backend.dto

import java.io.Serializable

data class ActualizarPersonajeDto(
    val nombre: String,
    //Supongo que esto es tipo
    val estadisticas: List<EstatDto>

): Serializable{
    data class EstatDto (
        val nombre: String,
        val valorNuevo: Int
    ): Serializable
}
