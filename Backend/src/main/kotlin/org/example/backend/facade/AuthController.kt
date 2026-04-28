package org.example.backend.facade

import org.example.backend.entity.Usuario
import org.example.backend.repository.UsuarioRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.RequestMapping
import com.google.firebase.auth.FirebaseAuth

data class TokenRequest(val token: String)
@RestController
@RequestMapping("/auth")
@CrossOrigin(originPatterns = ["*"], allowCredentials = "true")
class AuthController(
    private val usuarioRepo: UsuarioRepository,
) {
    @PostMapping("/login")
    fun loginConGoogle(@RequestBody request: TokenRequest): ResponseEntity<Any> {
        return try {
            // 1. El "Portero" de Firebase verifica si el pase VIP es real
            val decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.token)

            // 2. Extraemos los datos seguros que nos da Google
            val uid = decodedToken.uid
            val email = decodedToken.email ?: ""
            val name = decodedToken.claims["name"] as? String ?: "Jugador"
            val picture = decodedToken.claims["picture"] as? String ?: "fotoUrl"

            // 3. Buscamos en BD o creamos el usuario si es su primera vez jugando
            val usuario = usuarioRepo.findByGoogleId(uid).orElseGet {
                val nuevoUsuario = Usuario(
                    googleId = uid,
                    email = email,
                    nombre = name,
                    fotoUrl = picture,
                    partidasParticipa = mutableListOf()
                )
                usuarioRepo.save(nuevoUsuario)
            }

            // 4. Devolvemos el usuario a Angular
            ResponseEntity.ok(usuario)

        } catch (e: Exception) {
            // Si el token es falso o ha caducado
            ResponseEntity.status(401).body(mapOf("error" to "Token inválido o expirado"))
        }
    }
}
