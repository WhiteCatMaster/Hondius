package org.example.backend.facade

import org.example.backend.dto.DatosPartidaDto
import org.example.backend.service.PersonajeService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.RequestMapping

@RestController
@RequestMapping("/personaje")
class PersonajeController(
    private val personajeService: PersonajeService
) {
    @GetMapping("/{id}")
    fun obtenerPersonajeById(@PathVariable id: Long): ResponseEntity<DatosPartidaDto.PersonajeDto> {
        val personaje = personajeService.getPersonajeById(id)
        var estadisticasDto = mutableListOf<DatosPartidaDto.PersonajeDto.EstadisticaDto>()
        var ataquesDto = mutableListOf<DatosPartidaDto.PersonajeDto.AtaqueDto>()
        for (estadistica in personaje?.estadisticas!!){
            val estadisticaDto = DatosPartidaDto.PersonajeDto.EstadisticaDto(
                id = estadistica.id,
                nombre = estadistica.nombre,
                valor = estadistica.valor,
                consumible = estadistica.consumible,
            )
            estadisticasDto.add(estadisticaDto)
        }
        for (i in personaje?.ataques!!){
            var manaAtacanteDto = mutableMapOf<String, Int>()
            var estadisticasDefensorDto = mutableMapOf<String, Double>()
            for (j in i.manaAtacante.keys){
                val clave = j.nombre
                manaAtacanteDto[clave] = i.manaAtacante[j] ?: 0
            }
            for (j in i.estadisticasDefensor.keys){
                val clave = j.nombre
                estadisticasDefensorDto[clave] = i.estadisticasDefensor[j] ?: 0.0
            }
            val ataqueDto = DatosPartidaDto.PersonajeDto.AtaqueDto(
                id = i.id,
                nombre = i.nombre,
                manaAtacante = manaAtacanteDto,
                estadisticasDefensor = estadisticasDefensorDto,
                dadoBase = i.dadoBase,
                ratioDado = i.ratioDado,
                danoAtaque = i.danioAtaque
            )
            ataquesDto.add(ataqueDto)
        }
        val personajeDto = DatosPartidaDto.PersonajeDto(
            id = personaje?.id,
            personajeNombre = personaje?.nombre,
            personajeVida = personaje?.vida,
            personajeFotoUrl = personaje?.fotoUrl,
            personajeEstadisticas = estadisticasDto,
            personajeAtaques = ataquesDto
        )
        return ResponseEntity.ok(personajeDto)
    }
}
