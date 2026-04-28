package org.example.backend.unit.facade

import org.example.backend.dto.CombatePersonajesDto
import org.example.backend.dto.CrearCombateDto
import org.example.backend.facade.CombateController
import org.example.backend.service.CombateService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode
import org.springframework.http.ResponseEntity

class CombateControllerTests {
    val combateService = mock<CombateService>()
    val combateController = CombateController(combateService)

    /*

    @Test
    fun testCrearCombate(){
        val jugadorUnoDto = CrearCombateDto.JugadorDto(10L, 20L, "ADMIN", 100L)
        val jugadorDosDto = CrearCombateDto.JugadorDto(11L, 21L, "JUGADOR", 101L)

        val crearCombateDto = CrearCombateDto(1L, "batalla epica", jugadorUnoDto, jugadorDosDto, 1000L)

        whenever(combateService.crearCombatexDTO(any())).thenReturn(crearCombateDto)

        val result = combateController.crearCombate(mock<CrearCombateDto>())

        assertEquals(HttpStatusCode.valueOf(200).value(), result.statusCode.value())
        assertEquals(jugadorDosDto, result.body?.jugador2)
    }
     */

    @Test
    fun testObtenerPersonajesCombateById_Exito() {
        // Arrange
        val idBusqueda = 1L

        val dtoFalso = mock<CombatePersonajesDto>()
        val respuestaServicio = ResponseEntity.ok(dtoFalso)

        whenever(combateService.obtenerCombateById(idBusqueda)).thenReturn(respuestaServicio)

        // Act
        val resultado = combateController.obtenerPersonajesCombateById(idBusqueda)

        // Assert
        assertEquals(HttpStatus.OK, resultado.statusCode)
        assertEquals(dtoFalso, resultado.body)
        verify(combateService).obtenerCombateById(idBusqueda)
    }

    @Test
    fun testObtenerPersonajesCombateById_NoEncontrado() {
        // Arrange
        val idBusqueda = 99L

        // Simulamos que el servicio lanza la misma excepción que comprobamos en su test
        whenever(combateService.obtenerCombateById(idBusqueda)).thenThrow(NoSuchElementException())

        // Act & Assert
        // Como el controlador no tiene un try-catch, la excepción subirá hacia arriba
        assertThrows<NoSuchElementException> {
            combateController.obtenerPersonajesCombateById(idBusqueda)
        }
        verify(combateService).obtenerCombateById(idBusqueda)
    }
}