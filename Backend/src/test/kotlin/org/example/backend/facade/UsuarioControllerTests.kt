package org.example.backend.facade

import org.example.backend.entity.Usuario
import org.example.backend.service.UsuarioService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
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

}