package org.example.backend.observability

import io.micrometer.core.instrument.Counter
import io.micrometer.core.instrument.MeterRegistry
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.example.backend.entity.Juego
import org.example.backend.entity.Personaje
import org.example.backend.entity.Usuario
import org.springframework.stereotype.Component

@Component
@Aspect
class RepositoryMetricsHandler(meterRegistry: MeterRegistry) {

    private val usuariosRegistradosCounter: Counter =
        Counter
            .builder("juegorol_usuarios_registrados")
            .description("Numero total de usuarios registrados")
            .register(meterRegistry)

    private val juegosCreadosCounter: Counter =
        Counter
            .builder("juegorol_juegos_creados")
            .description("Numero total de juegos creados")
            .register(meterRegistry)

    private val personajesCreadosCounter: Counter =
        Counter
            .builder("juegorol_personajes_creados")
            .description("Numero total de personajes creados")
            .register(meterRegistry)

    @Around("execution(* org.example.backend.repository.UsuarioRepository.save(..))")
    fun medirAltaUsuario(joinPoint: ProceedingJoinPoint): Any? {
        val entityBeforeSave = joinPoint.args.firstOrNull() as? Usuario
        val eraNuevo = entityBeforeSave?.id == null
        val resultado = joinPoint.proceed()

        if (eraNuevo && resultado is Usuario && resultado.id != null) {
            usuariosRegistradosCounter.increment()
        }

        return resultado
    }

    @Around("execution(* org.example.backend.repository.JuegoRepository.save(..))")
    fun medirCreacionJuego(joinPoint: ProceedingJoinPoint): Any? {
        val entityBeforeSave = joinPoint.args.firstOrNull() as? Juego
        val eraNuevo = entityBeforeSave?.id == null
        val resultado = joinPoint.proceed()

        if (eraNuevo && resultado is Juego && resultado.id != null) {
            juegosCreadosCounter.increment()
        }

        return resultado
    }

    @Around("execution(* org.example.backend.repository.PersonajeRepository.save(..))")
    fun medirCreacionPersonaje(joinPoint: ProceedingJoinPoint): Any? {
        val entityBeforeSave = joinPoint.args.firstOrNull() as? Personaje
        val eraNuevo = entityBeforeSave?.id == null
        val resultado = joinPoint.proceed()

        if (eraNuevo && resultado is Personaje && resultado.id != null) {
            personajesCreadosCounter.increment()
        }

        return resultado
    }

    @Around("execution(* org.example.backend.repository.PersonajeRepository.saveAll(..))")
    fun medirCreacionPersonajesEnLote(joinPoint: ProceedingJoinPoint): Any? {
        val elementos = joinPoint.args.firstOrNull() as? Iterable<*>
        val nuevosAntes = elementos?.count { it is Personaje && it.id == null } ?: 0
        val resultado = joinPoint.proceed()

        repeat(nuevosAntes) {
            personajesCreadosCounter.increment()
        }

        return resultado
    }
}

