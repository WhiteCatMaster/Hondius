package org.example.backend.observability

import io.micrometer.core.instrument.Counter
import io.micrometer.core.instrument.MeterRegistry
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.example.backend.entity.Juego
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
}

