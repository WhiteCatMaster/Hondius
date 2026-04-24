package org.example.backend.facade

import org.example.backend.entity.Usuario
import org.example.backend.service.UsuarioService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class RegistrarUsuarioRequest(
    val googleId: String,
    val email: String,
    val nombre: String,
    val fotoUrl: String? = null
)

@RestController
@RequestMapping("/api/usuarios", "/usuarios")
class UsuarioController(
    private val usuarioService: UsuarioService
) {

    @PostMapping
    fun registrarUsuario(@RequestBody request: RegistrarUsuarioRequest): ResponseEntity<Any> {
        return try {
            val usuario = Usuario(
                googleId = request.googleId,
                email = request.email,
                nombre = request.nombre,
                fotoUrl = request.fotoUrl
            )
            val usuarioGuardado = usuarioService.createUsuario(usuario)
            ResponseEntity.status(HttpStatus.CREATED).body(usuarioGuardado)
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("error" to e.message))
        }
    }

    @GetMapping
    fun listarUsuarios(): ResponseEntity<List<Usuario>> {
        return ResponseEntity.ok(usuarioService.getAllUsuarios())
    }
}

