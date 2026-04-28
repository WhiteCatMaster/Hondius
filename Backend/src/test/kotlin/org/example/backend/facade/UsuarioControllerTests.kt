package org.example.backend.facade

import org.example.backend.entity.Juego
import org.example.backend.entity.JugadorJuego
import org.example.backend.entity.RolJugador
import org.example.backend.entity.Usuario
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


class UsuarioControllerTests {
    private val usuarioService = mock<UsuarioService>()
    private val usuarioController = UsuarioController(usuarioService)

    @Test
    fun testRegistrarUsuario() {
        val usuarioFalso = Usuario(1L,"337d","aMail@mail.com", "Pepe", "foto.url",mutableListOf())
        whenever(usuarioService.createUsuario(any())).thenReturn(usuarioFalso)

        val result = usuarioController.registrarUsuario(RegistrarUsuarioRequest(usuarioFalso.googleId, usuarioFalso.email,usuarioFalso.nombre, usuarioFalso.fotoUrl))
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

        // Preparamos el juego falso
        val juegoMock = mock<Juego> {
            on { id } doReturn 100L
            on { nombre } doReturn "Juego Test"
            on { descripcion } doReturn "Descripción Test"
            on { idioma } doReturn "ES"
            on { maximoJugadores } doReturn 4
        }

        // Preparamos el registro intermedio (JugadorJuego)
        val jugadorJuegoMock = mock<JugadorJuego> {
            on { id } doReturn 10L
            on { juego } doReturn juegoMock
            // Asumo que tienes un enum llamado RolJugador, ajusta el nombre si es distinto
            on { rol } doReturn RolJugador.ADMIN
        }

        // Preparamos el usuario devuelto por la base de datos
        val usuarioMock = mock<Usuario> {
            on { id } doReturn 1L
            on { googleId } doReturn googleIdBuscado
            on { email } doReturn "test@test.com"
            on { nombre } doReturn "Usuario Test"
            on { fotoUrl } doReturn "url_foto"
            on { partidasParticipa } doReturn mutableListOf(jugadorJuegoMock)
        }

        whenever(usuarioService.findByGoogleId(googleIdBuscado)).thenReturn(java.util.Optional.of(usuarioMock))

        // 2. ACT
        val resultado = usuarioController.obtenerUsuarioxGoogleId(googleIdBuscado)

        // 3. ASSERT
        assertEquals(HttpStatus.OK, resultado.statusCode)

        val body = resultado.body!!
        assertEquals(1L, body.id)
        assertEquals(googleIdBuscado, body.googleId)
        assertEquals("test@test.com", body.email)

        // Verificamos el mapeo de la lista de partidas
        assertEquals(1, body.partidasParticipa.size)
        val partidaDto = body.partidasParticipa[0]
        assertEquals(10L, partidaDto.id)
        assertEquals("ADMIN", partidaDto.rol)

        // Verificamos los datos del juego anidado
        assertEquals(100L, partidaDto.juego?.id)
        assertEquals("Juego Test", partidaDto.juego?.nombre)
    }

    @Test
    fun testObtenerUsuarioxGoogleId_NoEncontrado() {
        // ARRANGE
        val googleIdBuscado = "google-no-existe"
        whenever(usuarioService.findByGoogleId(googleIdBuscado)).thenReturn(java.util.Optional.empty())

        // ACT & ASSERT
        assertThrows<NoSuchElementException> {
            usuarioController.obtenerUsuarioxGoogleId(googleIdBuscado)
        }
    }
}
