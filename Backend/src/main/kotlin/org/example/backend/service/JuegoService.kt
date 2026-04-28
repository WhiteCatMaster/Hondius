package org.example.backend.service

import jakarta.transaction.Transactional
import org.example.backend.dto.CrearPartidaDto
import org.example.backend.dto.DatosPartidaDto
import org.example.backend.dto.PartidaDto
import org.example.backend.entity.Ataque
import org.example.backend.entity.Estadistica
import org.example.backend.entity.Juego
import org.example.backend.entity.JugadorJuego
import org.example.backend.entity.Personaje
import org.example.backend.entity.RolJugador
import org.example.backend.repository.AtaqueRepository
import org.example.backend.repository.EstadisticaRepository
import org.example.backend.repository.JuegoRepository
import org.example.backend.repository.JugadorJuegoRepository
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
    private val estadisticaService: EstadisticaService
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
        val partida : Juego = juegoRepo.findById(id).orElse(null)
        var personajes = mutableListOf<DatosPartidaDto.PersonajeDto>()
        for (personaje in partida.personajes) {
            var ataques = mutableListOf<DatosPartidaDto.PersonajeDto.AtaqueDto>()
            var estadisticas = mutableListOf<DatosPartidaDto.PersonajeDto.EstadisticaDto>()
            for (i in personaje.estadisticas){
                val estadisticaDto = DatosPartidaDto.PersonajeDto.EstadisticaDto(
                    id = i.id,
                    nombre = i.nombre,
                    valor = i.valor,
                    consumible = i.consumible,
                )
                estadisticas.add(estadisticaDto)
            }
            for (i in personaje.ataques){
                var manaAtacanteDto = mutableMapOf<String, Int>()
                var estadisticasDefensorDto = mutableMapOf<String, Double>()
                for (j in i.manaAtacante.keys){
                    val clave = j.nombre
                    manaAtacanteDto[clave] = i.manaAtacante[j] ?: 0
                }
                for (j in i.estadisticasDefensor.keys){
                    val clave = j.nombre
                    estadisticasDefensorDto[clave] = i.estadisticasDefensor[j] ?: 0.0
                }
                val ataqueDto = DatosPartidaDto.PersonajeDto.AtaqueDto(
                    id = i.id,
                    nombre = i.nombre,
                    manaAtacante = manaAtacanteDto,
                    estadisticasDefensor = estadisticasDefensorDto,
                    dadoBase = i.dadoBase,
                    ratioDado = i.ratioDado,
                    danoAtaque = i.danioAtaque
                )
                ataques.add(ataqueDto)
            }
            val personajeDto = DatosPartidaDto.PersonajeDto(
                id = personaje.id,
                personajeNombre = personaje.nombre,
                personajeVida = personaje.vida,
                personajeFotoUrl = personaje.fotoUrl,
                personajeEstadisticas = estadisticas,
                personajeAtaques = ataques
            )
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
        var personajes = mutableListOf<Personaje>()
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

            val estats = mutableListOf<Estadistica>()
            val buscadorEstadisticas = mutableMapOf<String, Estadistica>()

            // 1. Cargamos las estadísticas y las indexamos por nombre
            for (estatDTO in personajeDTO.personajeEstadisticas){
                val estat = Estadistica(
                    nombre = estatDTO.nombre ?: "",
                    valor = estatDTO.valor ?: 0,
                    consumible = estatDTO.consumible,
                )
                println("Guardando estadistica: nombre=${estat.nombre}, valor=${estat.valor}, consumible=${estat.consumible}")
                estats.add(estat)
                buscadorEstadisticas[estat.nombre] = estat
            }

            val ataques = mutableListOf<Ataque>()

            // 2. Cargamos los ataques buscando las referencias directas en el diccionario
            for (ataqueDTO in personajeDTO.personajeAtaques){

                val estatsDefensor = mutableMapOf<Estadistica, Double>()
                for ((nombreEst, valorDef) in ataqueDTO.estadisticasDefensor) {
                    val estadisticaEncontrada = buscadorEstadisticas[nombreEst]
                    if (estadisticaEncontrada != null) {
                        estatsDefensor[estadisticaEncontrada] = valorDef
                    }
                }

                val manaAtacante = mutableMapOf<Estadistica, Int>()
                for ((nombreEst, valorMana) in ataqueDTO.manaAtacante) {
                    val estadisticaEncontrada = buscadorEstadisticas[nombreEst]
                    if (estadisticaEncontrada != null) {
                        manaAtacante[estadisticaEncontrada] = valorMana
                    }
                }

                val ataque = Ataque(
                    nombre = ataqueDTO.nombre ?: "",
                    dadoBase = ataqueDTO.dadoBase,
                    ratioDado = ataqueDTO.ratioDado,
                    estadisticasDefensor = estatsDefensor,
                    manaAtacante = manaAtacante,
                    danioAtaque = ataqueDTO.danoAtaque
                )
                ataques.add(ataque)
            }

            println("Guardando ataques desde DTO...")
            println("Guardando personajes desde DTO...")

            // 3. Montamos el personaje con sus listas ya enlazadas
            val personaje = Personaje(
                nombre = personajeDTO.personajeNombre ?: "",
                vida = personajeDTO.personajeVida ?: 0,
                fotoUrl = personajeDTO.personajeFotoUrl ?: "",
                estadisticas = estats,
                ataques = ataques,
            )

            // Relaciones bidireccionales
            for (i in personaje.estadisticas){
                i.personaje = personaje
            }
            for (i in personaje.ataques){
                i.owner = personaje
            }

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