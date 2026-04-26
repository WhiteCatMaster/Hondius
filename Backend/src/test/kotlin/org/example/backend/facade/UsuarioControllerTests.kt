package org.example.backend.facade

import org.example.backend.entity.Usuario
import org.example.backend.service.UsuarioService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.springframework.http.HttpStatus


class UsuarioControllerTests {
    private val usuarioService = mock(UsuarioService::class.java)
    private val usuarioController = UsuarioController(usuarioService)

    @Test
    fun testRegistrarUsuario() {
        val usuarioFalso = Usuario(1L,"337d","aMail@mail.com", "Pepe", "foto.url",mutableListOf())
        `when`(usuarioService.createUsuario(anyObject())).thenReturn(usuarioFalso)

        val result = usuarioController.registrarUsuario(RegistrarUsuarioRequest(usuarioFalso.googleId, usuarioFalso.email,usuarioFalso.nombre, usuarioFalso.fotoUrl))
        assertEquals(HttpStatus.CREATED, result.statusCode)
        val responseBody = result.body as Usuario
        assertEquals("337d", responseBody.googleId)
        verify(usuarioService).createUsuario(anyObject())


    }

    @Test
    fun testListarUsuario() {

        `when`(usuarioService.getAllUsuarios()).thenReturn(listOf())

        val result = usuarioController.listarUsuarios()
        assertEquals(HttpStatus.OK, result.statusCode)
        verify(usuarioService).getAllUsuarios()

    }

    // Uso esta funcion en vez de importar any por fallos que da
    //TODO Cambiar a librería mockito especifica para kotlin y refactorizar tests
    private fun <T> anyObject(): T {
        org.mockito.ArgumentMatchers.any<T>()
        return null as T
    }
}