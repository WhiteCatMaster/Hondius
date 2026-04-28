package org.example.backend.facade

import org.example.backend.dto.CrearPartidaDto
import org.example.backend.dto.DatosPartidaDto
import org.example.backend.dto.PartidaDto
import org.example.backend.service.JuegoService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import tools.jackson.databind.JsonNode
import tools.jackson.databind.node.ObjectNode
import tools.jackson.module.kotlin.jacksonObjectMapper

// DTO para la solicitud de crear partida (es un alias de JuegoDto)
//typealias CrearPartidaDto = JuegoDto

@RestController
@RequestMapping("/api/partida", "/partida")
class PartidaController(
    private val partidaService: JuegoService
) {

    @PostMapping
    fun crearPartida(@RequestBody payload: JsonNode): ResponseEntity<Any> {
        return try {
            val juegoNode = payload.get("juego") ?: payload
            val juegoDto = jsonMapper.treeToValue(normalizarNodoPartida(juegoNode), CrearPartidaDto::class.java)
            val juegoGuardado = partidaService.crearJuegoxDTO(juegoDto)

            // Devolvemos un 201 Created con el resultado
            ResponseEntity.status(HttpStatus.CREATED).body(juegoGuardado)
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("error" to e.message))
        }
    }

    private fun normalizarNodoPartida(juegoNode: JsonNode): JsonNode {
        val objectNode = (juegoNode as? ObjectNode)?.deepCopy() ?: return juegoNode

        val adminIdNode = objectNode.get("adminId")
        if (adminIdNode == null || adminIdNode.isNull) {
            objectNode.remove("adminId")
            return objectNode
        }

        if (adminIdNode.isTextual) {
            val adminIdTexto = adminIdNode.asText().trim()
            val adminId = adminIdTexto.toLongOrNull()
            if (adminId == null) {
                objectNode.remove("adminId")
            } else {
                objectNode.put("adminId", adminId)
            }
        }

        return objectNode
    }
    @GetMapping
    fun obtenerPartidas(): ResponseEntity<List<PartidaDto>>{

            val listaPartidas: List<PartidaDto> = partidaService.getAllPartidas()

            return ResponseEntity.status(HttpStatus.OK).body(listaPartidas)


    }
    @GetMapping("/{id}")
    fun obtenerDatosPartida(@PathVariable id: Long): ResponseEntity<DatosPartidaDto>? {
        val partida = partidaService.obtenerDatosPartida(id)
        return partida
    }

}

private val jsonMapper = jacksonObjectMapper()

