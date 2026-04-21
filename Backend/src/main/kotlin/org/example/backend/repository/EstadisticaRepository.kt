package org.example.backend.repository

import org.example.backend.entity.Estadistica
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface EstadisticaRepository : JpaRepository<Estadistica, Long> {
    //fun findByNombre(nombre: String): Estadistica
    //Cada personaje deberia tener un set de estats con nombre unico cada una
    fun findByNombreAndPersonajeId(nombre: String, personajeId: Long): Estadistica?
}