package org.example.backend.unit.facade

import org.example.backend.dto.CrearPartidaDto
import org.example.backend.dto.PartidaDto
import org.example.backend.facade.PartidaController
import org.example.backend.service.JuegoService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus
import tools.jackson.module.kotlin.jacksonObjectMapper

class PartidaControllerTests (){

    private val partidaService = mock<JuegoService>()
    private val jsonMapper = jacksonObjectMapper()
    private val partidaController = PartidaController(partidaService)

    @Test
    fun testCrearPartida() {
        val jugador = CrearPartidaDto.PersonajeDto()
        val dtoEntrada = CrearPartidaDto(
            nombre = "Partida",
            descripcion = "Description",
            idioma = "ES",
            maximoJugadores = 5,
            jugadores = mutableListOf(jugador),
            adminId = 1L
        )

        val payload = jsonMapper.createObjectNode()
        payload.set("juego", jsonMapper.valueToTree(dtoEntrada))


        val partidaCreada = PartidaDto(id = 1L, nombre = "Partida Creada")

        whenever(partidaService.crearJuegoxDTO(any())).thenReturn(partidaCreada)

        val result = partidaController.crearPartida(payload)

        assertEquals(HttpStatus.CREATED, result.statusCode)
        assertEquals(partidaCreada, result.body)
    }
    @Test
    fun testObtenerPartidas() {

        val partida1 = PartidaDto(id = 1L, nombre = "Partida 1", descripcion = "Desc 1", idioma = "ES", maximoJugadores = 4)
        val partida2 = PartidaDto(id = 2L, nombre = "Partida 2", descripcion = "Desc 2", idioma = "EN", maximoJugadores = 6)
        val listaFalsa = listOf(partida1, partida2)


        whenever(partidaService.getAllPartidas()).thenReturn(listaFalsa)


        val result = partidaController.obtenerPartidas()

        assertEquals(HttpStatus.OK, result.statusCode)
        assertEquals(listaFalsa, result.body)
        verify(partidaService).getAllPartidas()
    }
    @Test
    fun testObtenerPartidasListaVacia() {

        val listaVacia = emptyList<PartidaDto>()
        whenever(partidaService.getAllPartidas()).thenReturn(listaVacia)


        val result = partidaController.obtenerPartidas()
        
        assertEquals(HttpStatus.OK, result.statusCode)
        assertEquals(emptyList<PartidaDto>(), result.body)
        verify(partidaService).getAllPartidas()
    }
}
