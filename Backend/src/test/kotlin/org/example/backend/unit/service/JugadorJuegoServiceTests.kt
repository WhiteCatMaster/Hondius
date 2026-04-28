package org.example.backend.unit.service

import org.example.backend.entity.Juego
import org.example.backend.entity.JugadorJuego
import org.example.backend.entity.Personaje
import org.example.backend.entity.RolJugador
import org.example.backend.entity.Usuario
import org.example.backend.repository.JugadorJuegoRepository
import org.example.backend.service.JugadorJuegoService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.util.Optional

class JugadorJuegoServiceTests {

    private val jugadorJuegoRepo: JugadorJuegoRepository = mock<JugadorJuegoRepository>()
    private val jugadorJuegoService = JugadorJuegoService(jugadorJuegoRepo)

    // Variables simuladas para rellenar los constructores obligatorios sin crear toda la jerarquía
    private val usuarioMock = mock<Usuario>()
    private val juegoMock = mock<Juego>()
    private val personajeMock = mock<Personaje>()

    @Test
    fun testGetAllJugadoresJuego() {
        val listaFalsa = listOf(
            JugadorJuego(1L, usuarioMock, juegoMock, RolJugador.JUGADOR, null),
            JugadorJuego(2L, usuarioMock, juegoMock, RolJugador.JUGADOR, personajeMock)
        )
        whenever(jugadorJuegoRepo.findAll()).thenReturn(listaFalsa)

        val resultado = jugadorJuegoService.getAllJugadoresJuego()

        assertEquals(2, resultado.size)
        verify(jugadorJuegoRepo).findAll()
    }

    @Test
    fun testGetJugadorJuegoById() {
        val jugadorFalso = JugadorJuego(1L, usuarioMock, juegoMock, RolJugador.JUGADOR, null)
        whenever(jugadorJuegoRepo.findById(1L)).thenReturn(Optional.of(jugadorFalso))

        val resultado = jugadorJuegoService.getJugadorJuegoById(1L)

        assertEquals(1L, resultado?.id)
        verify(jugadorJuegoRepo).findById(1L)
    }

    @Test
    fun testGetJugadorJuegoByIdInexistente() {
        whenever(jugadorJuegoRepo.findById(99L)).thenReturn(Optional.empty())

        val resultado = jugadorJuegoService.getJugadorJuegoById(99L)

        assertEquals(null, resultado)
        verify(jugadorJuegoRepo).findById(99L)
    }

    @Test
    fun testCreateJugadorJuego() {
        val nuevoJugador = JugadorJuego(null, usuarioMock, juegoMock, RolJugador.JUGADOR, null)
        val jugadorGuardado = JugadorJuego(1L, usuarioMock, juegoMock, RolJugador.JUGADOR, null)

        whenever(jugadorJuegoRepo.save(nuevoJugador)).thenReturn(jugadorGuardado)

        val resultado = jugadorJuegoService.createJugadorJuego(nuevoJugador)

        assertEquals(1L, resultado.id)
        verify(jugadorJuegoRepo).save(nuevoJugador)
    }

    @Test
    fun testUpdateJugadorJuego() {
        val jugadorExistente = JugadorJuego(1L, usuarioMock, juegoMock, RolJugador.JUGADOR, null)
        // Simulamos un objeto con los datos que queremos actualizar (ej. se le asigna un rol distinto y un personaje)
        val datosActualizados = JugadorJuego(null, usuarioMock, juegoMock, RolJugador.ADMIN, personajeMock)

        whenever(jugadorJuegoRepo.findById(1L)).thenReturn(Optional.of(jugadorExistente))
        whenever(jugadorJuegoRepo.save(jugadorExistente)).thenReturn(jugadorExistente)

        val resultado = jugadorJuegoService.updateJugadorJuego(1L, datosActualizados)

        assertEquals(RolJugador.ADMIN, resultado?.rol)
        assertEquals(personajeMock, resultado?.personaje)
        verify(jugadorJuegoRepo).findById(1L)
        verify(jugadorJuegoRepo).save(jugadorExistente)
    }

    @Test
    fun testUpdateJugadorJuegoInexistente() {
        val datosActualizados = JugadorJuego(null, usuarioMock, juegoMock, RolJugador.JUGADOR, null)
        whenever(jugadorJuegoRepo.findById(99L)).thenReturn(Optional.empty())

        val resultado = jugadorJuegoService.updateJugadorJuego(99L, datosActualizados)

        assertEquals(null, resultado)
        verify(jugadorJuegoRepo).findById(99L)
        verify(jugadorJuegoRepo, never()).save(any())
    }

    @Test
    fun testDeleteJugadorJuego() {
        jugadorJuegoService.deleteJugadorJuego(1L)
        verify(jugadorJuegoRepo).deleteById(1L)
    }

    @Test
    fun testAsignarPersonaje() {
        val jugadorExistente = JugadorJuego(1L, usuarioMock, juegoMock, RolJugador.JUGADOR, null)

        whenever(jugadorJuegoRepo.findById(1L)).thenReturn(Optional.of(jugadorExistente))
        whenever(jugadorJuegoRepo.save(jugadorExistente)).thenReturn(jugadorExistente)

        //Como el metodo asignarPersonaje actual aún no tiene la lógica implementada (solo hace findById y save), el test verifica solo eso.
        val resultado = jugadorJuegoService.asignarPersonaje(1L, 5L)

        assertEquals(1L, resultado?.id)
        verify(jugadorJuegoRepo).findById(1L)
        verify(jugadorJuegoRepo).save(jugadorExistente)
    }

    @Test
    fun testAsignarPersonajeInexistente() {
        whenever(jugadorJuegoRepo.findById(99L)).thenReturn(Optional.empty())

        val resultado = jugadorJuegoService.asignarPersonaje(99L, 5L)

        assertEquals(null, resultado)
        verify(jugadorJuegoRepo).findById(99L)
        verify(jugadorJuegoRepo, never()).save(any())
    }
}