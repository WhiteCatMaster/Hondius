package org.example.backend.facade

import org.example.backend.dto.CrearPartidaDto
import org.example.backend.dto.PartidaDto
import org.example.backend.service.EstadisticaService
import org.example.backend.service.JuegoService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity

class PartidaControllerTests (){

    private val partidaService = mock(JuegoService::class.java)
    private val partidaController = PartidaController(partidaService)
    /*
    @Test
    fun testCrearPartida(){
        val jugador = mock(CrearPartidaDto.PersonajeDto::class.java)
        val crearPartidaDto = mock(CrearPartidaDto::class.java)

        `when`(partidaService.crearJuegoxDTO(crearPartidaDto)).thenReturn(mock(PartidaDto::class.java))
        val result = partidaController.crearPartida(CrearPartidaRequest(CrearPartidaDto(nombre = "Partida", "Description", "ES",5,mutableListOf(jugador))))
        assertEquals(HttpStatus.CREATED, result.statusCode)
    }

     */
    @Test
    fun testObtenerPartidas() {

        val partida1 = PartidaDto(id = 1L, nombre = "Partida 1", descripcion = "Desc 1", idioma = "ES", maximoJugadores = 4)
        val partida2 = PartidaDto(id = 2L, nombre = "Partida 2", descripcion = "Desc 2", idioma = "EN", maximoJugadores = 6)
        val listaFalsa = listOf(partida1, partida2)


        `when`(partidaService.getAllPartidas()).thenReturn(listaFalsa)


        val result = partidaController.obtenerPartidas()

        assertEquals(HttpStatus.OK, result.statusCode)
        assertEquals(listaFalsa, result.body)
        verify(partidaService).getAllPartidas()
    }
    @Test
    fun testObtenerPartidasListaVacia() {

        val listaVacia = emptyList<PartidaDto>()
        `when`(partidaService.getAllPartidas()).thenReturn(listaVacia)


        val result = partidaController.obtenerPartidas()
        
        assertEquals(HttpStatus.OK, result.statusCode)
        assertEquals(emptyList<PartidaDto>(), result.body)
        verify(partidaService).getAllPartidas()
    }
}
