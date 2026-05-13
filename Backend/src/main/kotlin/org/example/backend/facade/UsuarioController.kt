package org.example.backend.facade

import org.example.backend.dto.ActualizarUsuarioDto
import org.example.backend.dto.UsuarioDto
import org.example.backend.entity.Usuario
import org.example.backend.repository.UsuarioRepository
import org.example.backend.service.UsuarioService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

data class RegistrarUsuarioRequest(
    val googleId: String,
    val email: String,
    val nombre: String,
    val fotoUrl: String? = null
)

@RestController
@RequestMapping("/api/usuario", "/usuario")
class UsuarioController(
    private val usuarioService: UsuarioService,
    private val usuarioRepo : UsuarioRepository
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
    @GetMapping("/{googleId}")
    fun obtenerUsuarioxGoogleId(@PathVariable googleId: String): ResponseEntity<UsuarioDto> {
        val usuario = usuarioService.findByGoogleId(googleId).get()
        val resultado = usuario.usuarioToDto()
        return ResponseEntity.ok(resultado)
    }
    @PutMapping("/{googleId}")
    fun cambiarFotoONombre(@PathVariable googleId: String, @RequestBody usuarioDto : ActualizarUsuarioDto): ResponseEntity<UsuarioDto> {
        val usuario = usuarioService.findByGoogleId(googleId).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
        usuario.nombre = usuarioDto.nombre
        usuario.fotoUrl = usuarioDto.fotoUrl
        val usuarioGuardado = usuarioRepo.save(usuario)
        val resultado = usuarioGuardado.usuarioToDto()
        return ResponseEntity.ok(resultado)
    }
}

