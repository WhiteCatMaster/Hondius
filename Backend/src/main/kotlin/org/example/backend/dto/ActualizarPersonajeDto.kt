package org.example.backend.dto

data class ActualizarPersonajeDto(
    val nombre: String,
    //Supongo que esto es tipo
    val estadisticas: List<EstatDto>

){
    data class EstatDto (
        val nombre: String,
        val valorNuevo: Int
    )
}
