package org.example.backend.facade

import org.example.backend.dto.ActualizarPersonajeDto
import org.example.backend.dto.DatosPartidaDto
import org.example.backend.service.PersonajeService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.RequestMapping

@RestController
@RequestMapping("/personaje")
class PersonajeController(
    private val personajeService: PersonajeService
) {
    /*

     */
    @PutMapping("/{id}")
    fun modificarPersonaje(@RequestBody personajeDto : ActualizarPersonajeDto, @PathVariable id: Long): DatosPartidaDto.PersonajeDto{
        //Supuestamente es mejor aplastar debido al hibernate
        val personaje = personajeService.actualizarPersonaje(id, personajeDto)
        return personajeService.personajeToDto(personaje)

    }
    @GetMapping("/{id}")
    fun obtenerPersonajeById(@PathVariable id: Long): ResponseEntity<DatosPartidaDto.PersonajeDto> {
        val personaje = personajeService.getPersonajeById(id) ?: return ResponseEntity.notFound().build()
        val personajeDto =  personajeService.personajeToDto(personaje)
        return ResponseEntity.ok(personajeDto)
    }
}
