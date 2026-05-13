package org.example.backend.facade

import org.example.backend.dto.CombatePersonajesDto
import org.example.backend.dto.CrearCombateDto
import org.example.backend.service.CombateService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.RequestMapping

@RestController
@RequestMapping("/partida/combate")
class CombateController(
    private val combateService: CombateService
) {
    @PostMapping
    fun crearCombate(@RequestBody dto: CrearCombateDto): ResponseEntity<CrearCombateDto> {
        val resultado = combateService.crearCombatexDTO(dto)
        return ResponseEntity.ok(resultado)
    }
    @GetMapping("/{id}")
    fun obtenerPersonajesCombateById(@PathVariable id: Long): ResponseEntity<CombatePersonajesDto> {
        val resultado = combateService.obtenerCombateById(id)
        return resultado
    }
}
