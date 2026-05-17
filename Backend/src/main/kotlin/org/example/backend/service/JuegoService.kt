package org.example.backend.service

import jakarta.transaction.Transactional
import org.example.backend.dto.CrearPartidaDto
import org.example.backend.dto.DatosPartidaDto
import org.example.backend.dto.PartidaDto
import org.example.backend.entity.Juego
import org.example.backend.entity.JugadorJuego
import org.example.backend.entity.Personaje
import org.example.backend.entity.RolJugador
import org.example.backend.repository.AtaqueRepository
import org.example.backend.repository.EstadisticaRepository
import org.example.backend.repository.JuegoRepository
import org.example.backend.repository.JugadorJuegoRepository
import org.example.backend.repository.ObjetoCompletoRepository
import org.example.backend.repository.PersonajeRepository
import org.example.backend.repository.UsuarioRepository
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service

@Service
class JuegoService(
    private val juegoRepo: JuegoRepository,
    private val usuarioRepo: UsuarioRepository,
    private val jugadorJuegoRepo: JugadorJuegoRepository,
    private val personajeRepo: PersonajeRepository,
    private val estadisticaRepo: EstadisticaRepository,
    private val ataqueRepo: AtaqueRepository,
    private val objetoRepo: ObjetoCompletoRepository,
    private val estadisticaService: EstadisticaService,
    private val personajeService: PersonajeService
) {
    fun getAllJuegos() = juegoRepo.findAll()

    fun obtenerIdAdminxPartida(partidaId:Long): Long{
        //Supongo que deberia de buscar dentro de la partida cual es el admin
        val partida = juegoRepo.findById(partidaId).get()
        var resultado = -1L
        for (jugadorJuego in partida.jugadores){
            if (jugadorJuego.juego?.id == partidaId && jugadorJuego.rol == RolJugador.ADMIN){
                resultado = jugadorJuego.usuario?.id ?: -1
            }
        }
        return resultado
    }
    fun getAllPartidas(): List<PartidaDto> {
        return juegoRepo.findAll().map { juego ->
            PartidaDto(
                id = juego.id,
                nombre = juego.nombre,
                descripcion = juego.descripcion,
                idioma = juego.idioma,
                maximoJugadores = juego.maximoJugadores
            )
        }
    }

    fun obtenerDatosPartida(id: Long): ResponseEntity<DatosPartidaDto> {
        val partida = juegoRepo.findById(id).orElse(null)
        val personajes = mutableListOf<DatosPartidaDto.PersonajeDto>()
        if (partida != null) {
            for (personaje in partida.personajes) {
                val personajeDto = personajeService.personajeToDto(personaje)
                personajes.add(personajeDto)
            }
            val resultado = DatosPartidaDto(
                id = partida.id,
                nombre = partida.nombre,
                descripcion = partida.descripcion,
                idioma = partida.idioma,
                maximoJugadores = partida.maximoJugadores,
                jugadores = personajes
            )
            return ResponseEntity.ok(resultado)
        }
        return ResponseEntity.notFound().build()

    }
    fun createJuego(juego: Juego) = juegoRepo.save(juego)

    fun eliminarJuego(id: Long) = juegoRepo.deleteById(id)

    fun asignarJugadorJuego(juegoId: Long, jugadorJuego: JugadorJuego): Juego? {
        val juego = juegoRepo.findById(juegoId).orElse(null) ?: return null
        juego.jugadores.add(jugadorJuego)
        return juegoRepo.save(juego)
    }

    fun modificarJuego(juegoId: Long, updatedJuego: Juego): Juego? {
        val existingJuego = juegoRepo.findById(juegoId).orElse(null) ?: return null
        existingJuego.nombre = updatedJuego.nombre
        existingJuego.jugadores = updatedJuego.jugadores
        return juegoRepo.save(existingJuego)
    }
    fun cambiarIdiomaJuego(juegoId: Long, nuevoIdioma: String): Juego? {
        val existingJuego = juegoRepo.findById(juegoId).orElse(null) ?: return null
        existingJuego.idioma = nuevoIdioma
        return juegoRepo.save(existingJuego)
    }
    @Transactional
    fun crearJuegoxDTO(juegoDTO: CrearPartidaDto): PartidaDto {
        val personajes = mutableListOf<Personaje>()
        val juego = Juego(
            nombre = juegoDTO.nombre ?: "",
            idioma = juegoDTO.idioma,
            descripcion = juegoDTO.descripcion,
            maximoJugadores = juegoDTO.maximoJugadores,
            personajes = mutableListOf(),
        )
        val usuarioadmin = juegoDTO.adminId?.let { usuarioRepo.findById(it).orElse(null) }

        val jugadorAdmin = usuarioadmin?.let {
            JugadorJuego(
                usuario = it,
                juego = juego,
                rol = RolJugador.ADMIN,
                personaje = null
            )
        }

        println("Guardando jugadores desde DTO...")

        // --- INICIO DEL BLOQUE MODIFICADO ---
        for (personajeDTO in juegoDTO.jugadores){
            println("Guardando estats desde DTO...")

            val personaje = personajeService.dtoToPersonaje(personajeDTO)

            personajes.add(personaje)
        }

        // --- FIN DEL BLOQUE MODIFICADO ---

        juego.personajes = personajes
        val juegoGuardado = juegoRepo.save(juego)
        val jugadorJuegoGuardado = jugadorAdmin?.let { jugadorJuegoRepo.save(it) }

        // ... (El resto de tu función de guardado se mantiene exactamente igual) ...

        val personajesGuardados = personajeRepo.saveAll(personajes)
        println("Personajes guardados: ${personajesGuardados.size}")
        for (i in personajes){
            val estatsGuardadas = estadisticaRepo.saveAll(i.estadisticas)
            println("Estadisticas guardadas: ${estatsGuardadas.size}")
            val ataquesGuardados = ataqueRepo.saveAll(i.ataques)
            println("Ataques guardados: ${ataquesGuardados.size}")
            val objetosGuardados = objetoRepo.saveAll(i.inventario)
            println("Objetos guardados: ${objetosGuardados.size}")
        }

        println("Devolviendo partida creada...")
        return PartidaDto(
            id = juegoGuardado.id,
            nombre = juegoGuardado.nombre,
            idioma = juegoGuardado.idioma,
            descripcion = juegoGuardado.descripcion,
            maximoJugadores = juegoGuardado.maximoJugadores,
            adminId = jugadorJuegoGuardado?.usuario?.id,
        )
    }

}