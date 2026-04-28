package org.example.backend.facade

import org.example.backend.dto.UsuarioDto
import org.example.backend.entity.Usuario
import org.example.backend.service.UsuarioService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
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
@RequestMapping("/api/usuario", "/usuario")
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
    @GetMapping("/{googleId}")
    fun obtenerUsuarioxGoogleId(@PathVariable googleId: String): ResponseEntity<UsuarioDto> {
        val usuario = usuarioService.findByGoogleId(googleId).get() ?: return ResponseEntity.notFound().build()
        val partidasDto = mutableListOf<UsuarioDto.JugadorJuegoDto>()
        for(jugadorJuego in usuario.partidasParticipa){
            val juegoDto = UsuarioDto.JuegoDto(
                id = jugadorJuego.juego?.id,
                nombre = jugadorJuego.juego?.nombre,
                descripcion = jugadorJuego.juego?.descripcion,
                idioma = jugadorJuego.juego?.idioma,
                maxJugadores = jugadorJuego.juego?.maximoJugadores
            )
            val jugadorJuegoDto = UsuarioDto.JugadorJuegoDto(
                id = jugadorJuego.id,
                juego =juegoDto,
                rol = jugadorJuego.rol.toString()
            )
            partidasDto.add(jugadorJuegoDto)
        }
        val resultado = UsuarioDto(
            id = usuario.id,
            googleId = usuario.googleId,
            email = usuario.email,
            nombre = usuario.nombre,
            fotoUrl = usuario.fotoUrl,
            partidasParticipa = partidasDto,
        )
        return ResponseEntity.ok(resultado)
    }
}

