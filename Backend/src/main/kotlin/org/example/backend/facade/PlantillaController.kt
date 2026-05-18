package org.example.backend.facade

import org.example.backend.dto.CrearPartidaDto
import org.example.backend.dto.PlantillaDto
import org.example.backend.dto.PlantillaRequestDto
import org.example.backend.entity.Plantilla
import org.example.backend.repository.PlantillaRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.RequestMapping
import tools.jackson.databind.ObjectMapper

@RestController
@RequestMapping("/plantilla")
class PlantillaController(
    private val plantillaRepo: PlantillaRepository,
    private val objectMapper: ObjectMapper,

    ) {
    @PostMapping
    fun guardarPlantilla(@RequestBody nuevaPlantilla: PlantillaRequestDto): ResponseEntity<Any>{
        val jsonTextoValido = objectMapper.writeValueAsString(nuevaPlantilla.jsonConfiguration)

        val plantilla = Plantilla(
            nombre = nuevaPlantilla.nombre,
            jsonConfiguration = jsonTextoValido // Guardamos el JSON perfecto en la BD
        )

        plantillaRepo.save(plantilla)
        return ResponseEntity.ok().build()
    }

    @GetMapping
    fun obtenerPlantillas(): ResponseEntity<List<PlantillaDto>>{
        val plantillas = plantillaRepo.findAll()
        val respuesta = plantillas.map {
            p-> PlantillaDto(
                id = p.id ?: -1,
                nombre = p.nombre,
                jsonConfiguration = objectMapper.readValue(p.jsonConfiguration, CrearPartidaDto::class.java),
            )
        }
        return ResponseEntity.ok(respuesta)
    }
}
