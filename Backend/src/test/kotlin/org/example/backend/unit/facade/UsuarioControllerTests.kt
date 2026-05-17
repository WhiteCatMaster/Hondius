package org.example.backend.unit.facade

import org.example.backend.entity.Juego
import org.example.backend.entity.JugadorJuego
import org.example.backend.entity.Personaje
import org.example.backend.entity.RolJugador
import org.example.backend.entity.Usuario
import org.example.backend.facade.RegistrarUsuarioRequest
import org.example.backend.facade.UsuarioController
import org.example.backend.repository.UsuarioRepository
import org.example.backend.service.UsuarioService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus
import java.util.Optional


class UsuarioControllerTests {
    private val usuarioService = mock<UsuarioService>()
    private val usuarioRepository = mock<UsuarioRepository>()
    private val usuarioController = UsuarioController(usuarioService, usuarioRepository)

    @Test
    fun testRegistrarUsuario() {
        val usuarioFalso = Usuario(1L,"337d","aMail@mail.com", "Pepe", "foto.url",mutableListOf())
        whenever(usuarioService.createUsuario(any())).thenReturn(usuarioFalso)

        val result = usuarioController.registrarUsuario(
            RegistrarUsuarioRequest(
                usuarioFalso.googleId,
                usuarioFalso.email,
                usuarioFalso.nombre,
                usuarioFalso.fotoUrl
            )
        )
        assertEquals(HttpStatus.CREATED, result.statusCode)
        val responseBody = result.body as Usuario
        assertEquals("337d", responseBody.googleId)
        verify(usuarioService).createUsuario(any())


    }

    @Test
    fun testListarUsuario() {

        whenever(usuarioService.getAllUsuarios()).thenReturn(listOf())

        val result = usuarioController.listarUsuarios()
        assertEquals(HttpStatus.OK, result.statusCode)
        verify(usuarioService).getAllUsuarios()

    }
    @Test
    fun testObtenerUsuarioxGoogleId_Exito() {
        // 1. ARRANGE
        val googleIdBuscado = "google-123"

        // Usamos objetos REALES en lugar de Mocks para las entidades
        val personajeReal = Personaje(
            id = 50L,
            nombre = "Heroe Test",
            vida = 100,
            estadisticas = mutableListOf(),
            ataques = mutableListOf(),
            inventario = mutableListOf()
        )

        val juegoReal = Juego(
            id = 100L,
            nombre = "Juego Test",
            descripcion = "Descripción Test",
            idioma = "ES",
            maximoJugadores = 4,
            jugadores = mutableListOf(),
            personajes = mutableListOf()
        )

        val jugadorJuegoReal = JugadorJuego(
            id = 10L,
            juego = juegoReal,
            rol = RolJugador.ADMIN,
            personaje = personajeReal
        )

        val usuarioReal = Usuario(
            id = 1L,
            googleId = googleIdBuscado,
            email = "test@test.com",
            nombre = "Usuario Test",
            fotoUrl = "url_foto",
            partidasParticipa = mutableListOf(jugadorJuegoReal)
        )

        // Cerramos la referencia circular igual que hace Hibernate
        jugadorJuegoReal.usuario = usuarioReal

        // El servicio sí es un mock, y devuelve nuestro usuario real
        whenever(usuarioService.findByGoogleId(googleIdBuscado)).thenReturn(Optional.of(usuarioReal))

        // 2. ACT
        val resultado = usuarioController.obtenerUsuarioxGoogleId(googleIdBuscado)

        // 3. ASSERT
        assertEquals(HttpStatus.OK, resultado.statusCode)

        val body = resultado.body!!
        assertEquals(1L, body.id)
        assertEquals(googleIdBuscado, body.googleId)
        assertEquals("test@test.com", body.email)

        assertEquals(1, body.partidasParticipa.size)
        val partidaDto = body.partidasParticipa[0]
        assertEquals(10L, partidaDto.id)
        assertEquals("ADMIN", partidaDto.rol.toString())

        assertEquals(100L, partidaDto.juego?.id)
        assertEquals("Juego Test", partidaDto.juego?.nombre)
    }

    @Test
    fun testObtenerUsuarioxGoogleId_NoEncontrado() {
        // ARRANGE
        val googleIdBuscado = "google-no-existe"
        whenever(usuarioService.findByGoogleId(googleIdBuscado)).thenReturn(Optional.empty())

        // ACT & ASSERT
        assertThrows<NoSuchElementException> {
            usuarioController.obtenerUsuarioxGoogleId(googleIdBuscado)
        }
    }
}
