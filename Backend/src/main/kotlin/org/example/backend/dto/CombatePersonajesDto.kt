package org.example.backend.dto

import java.io.Serializable

data class CombatePersonajesDto(
    val id: Long? = null,
    val personaje1 : DatosPartidaDto.PersonajeDto,
    val personaje2 : DatosPartidaDto.PersonajeDto,
    ): Serializable

