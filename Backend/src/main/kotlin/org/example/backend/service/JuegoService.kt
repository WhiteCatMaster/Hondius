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
        var estadisticas = mutableListOf<DatosPartidaDto.PersonajeDto.EstadisticaDto>()
        var ataques = mutableListOf<DatosPartidaDto.PersonajeDto.AtaqueDto>()
        for (personaje in partida.personajes) {
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
        val usuarioadmin = usuarioRepo.findById(juegoDTO.adminId).get()

        val jugadorAdmin = JugadorJuego(
            usuario = usuarioadmin,
            juego = juego,
            rol = RolJugador.ADMIN,
            personaje = null
        )

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
        val jugadorJuegoGuardado = jugadorJuegoRepo.save(jugadorAdmin)

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
            adminId = jugadorJuegoGuardado.usuario?.id,
        )
    }
    /*
    fun getDatosPartida(nombrePartida: String): JuegoDto? {
        val juego = juegoRepo.findByNombre(nombrePartida) ?: return null

        val jugadoresDTO = juego.jugadores.map { jugadorJuego ->
            JuegoDto.JugadorJuegoDto(
                id = jugadorJuego.id,
                usuarioGoogleId = jugadorJuego.usuario?.googleId,
                usuarioEmail = jugadorJuego.usuario?.email,
                usuarioNombre = jugadorJuego.usuario?.nombre,
                usuarioFotoUrl = jugadorJuego.usuario?.fotoUrl,
                rol = jugadorJuego.rol,
                personajeNombre = jugadorJuego.personaje?.nombre,
                personajeVida = jugadorJuego.personaje?.vida,
                personajeFotoUrl = jugadorJuego.personaje?.fotoUrl,
                personajeEstadisticas = jugadorJuego.personaje?.estadisticas?.map { stats ->
                    JuegoDto.JugadorJuegoDto.EstadisticaDto(
                        nombre = stats.nombre,
                        valor = stats.valor.toString(),
                        consumible = stats.consumible
                    )
                }?.toMutableList() ?: mutableListOf(),
                personajeAtaques = jugadorJuego.personaje?.ataques?.map { ataque ->
                    // Convertir Long IDs de vuelta a EstadisticaDto
                    val manaAtacanteDTO = ataque.manaAtacante.mapKeys { (id, _) ->
                        JuegoDto.JugadorJuegoDto.EstadisticaDto(
                            id = id,
                            nombre = null, // Se puede rellenar desde la BD si es necesario
                            valor = null,
                            consumible = false
                        )
                    }.toMutableMap()

                    val estadisticasDefensorDTO = ataque.estadisticasDefensor.mapKeys { (id, _) ->
                        JuegoDto.JugadorJuegoDto.EstadisticaDto(
                            id = id,
                            nombre = null,
                            valor = null,
                            consumible = false
                        )
                    }.toMutableMap()

                    var copiaManaAtacante = mutableMapOf<String,Int>();
                    for (key in manaAtacanteDTO.keys.indices) {
                        copiaManaAtacante[manaAtacanteDTO.keys.elementAt(key).toString()] = manaAtacanteDTO.values.elementAt(key);
                    }
                    var copiaEstadisticasDefensor  = mutableMapOf<String,Double>();
                    for (key in estadisticasDefensorDTO.keys.indices) {
                        copiaManaAtacante[manaAtacanteDTO.keys.elementAt(key).toString()] = manaAtacanteDTO.values.elementAt(key);
                    }
                    JuegoDto.JugadorJuegoDto.AtaqueDto(
                        id = ataque.id,
                        nombre = ataque.nombre,

                        manaAtacante = copiaManaAtacante,
                        estadisticasDefensor = copiaEstadisticasDefensor,
                        dadoBase = ataque.dadoBase,
                        ratioDado = ataque.ratioDado.toMutableList()
                    )
                }?.toMutableList() ?: mutableListOf()
            )
        }.toMutableList()

        return JuegoDto(
            nombre = juego.nombre,
            descripcion = juego.descripcion,
            idioma = juego.idioma,
            maximoJugadores = juego.maximoJugadores,
            jugadores = jugadoresDTO
        )
    }
    */
    /*

    @Transactional
    fun crearJuegoxDTO(juegoDTO: CrearPartidaDto): PartidaDto {
        // Crear el Juego
        val juego = Juego(
            nombre = juegoDTO.nombre ?: "",
            idioma = juegoDTO.idioma,
            descripcion = juegoDTO.descripcion,
            maximoJugadores = juegoDTO.maximoJugadores
        )
        val juegoGuardado = juegoRepo.save(juego)
        //Hasta aqui funciona
        // Crear los jugadores del DTO
        for (jugadorDTO in juegoDTO.jugadores) {
            // Crear o buscar el Usuario
            val usuario = usuarioRepo.findByGoogleId(jugadorDTO.usuarioGoogleId ?: "")
                .orElseGet {
                    Usuario(
                        googleId = jugadorDTO.usuarioGoogleId ?: "",
                        email = jugadorDTO.usuarioEmail ?: "",
                        nombre = jugadorDTO.usuarioNombre ?: "",
                        fotoUrl = jugadorDTO.usuarioFotoUrl
                    )
                }.let { usuarioRepo.save(it) }

            // Crear JugadorJuego
            val jugadorJuego = JugadorJuego(
                usuario = usuario,
                juego = juegoGuardado,
                rol = jugadorDTO.rol ?: RolJugador.JUGADOR,
                personaje = null // Se asignará después
            )
            val jugadorJuegoGuardado = jugadorJuegoRepo.save(jugadorJuego)

            // Crear Personaje si existe en el DTO
            if (jugadorDTO.personajeNombre != null) {
                val personaje = Personaje(
                    nombre = jugadorDTO.personajeNombre,
                    vida = jugadorDTO.personajeVida ?: 100,
                    fotoUrl = jugadorDTO.personajeFotoUrl,
                    jugadorJuego = jugadorJuegoGuardado
                )
                val personajeGuardado = personajeRepo.save(personaje)

                // Crear Estadísticas del Personaje
                for (estadisticaDTO in jugadorDTO.personajeEstadisticas) {
                    val estadistica = Estadistica(
                        nombre = estadisticaDTO.nombre ?: "",
                        valor = estadisticaDTO.valor?.toIntOrNull() ?: 0,
                        consumible = estadisticaDTO.consumible,
                        personaje = personajeGuardado
                    )
                    estadisticaRepo.save(estadistica)
                    personajeGuardado.estadisticas.add(estadistica)
                }

                // Crear Ataques del Personaje
                for (ataqueDTO in jugadorDTO.personajeAtaques) {
                    // Convertir EstadisticaDto a Long (usar el ID si existe, o generar uno temporal)
                    val manaAtacanteLong = ataqueDTO.manaAtacante.mapKeys { (estadistica, _) ->
                        estadistica ?: ""
                    }.toMutableMap()

                    val estadisticasDefensorLong = ataqueDTO.estadisticasDefensor.mapKeys { (estadistica, _) ->
                        estadistica ?: ""
                    }.toMutableMap()

                    var copiaManaAtacante2 = mutableMapOf<Estadistica, Int>();
                    var copiaEstadisticasDefensor2 = mutableMapOf<Estadistica, Double>();
                    var estadistica = Estadistica(
                        nombre = "",
                        valor = 0,
                        consumible = false,
                        personaje = null
                    )
                    /*
                    for (key in manaAtacanteLong.keys.indices) {
                        estadistica = estadisticaService.getEstadisticaByNombre(manaAtacanteLong.keys.elementAt(key))
                        copiaManaAtacante2[estadistica] = manaAtacanteLong.values.elementAt(key)
                    }
                    var estadistica2 = Estadistica(
                        nombre = "",
                        valor = 0,
                        consumible = false,
                        personaje = null
                    );
                    for (key in estadisticasDefensorLong.keys.indices) {
                        estadistica2 = estadisticaService.getEstadisticaByNombre(estadisticasDefensorLong.keys.elementAt(key))
                        copiaEstadisticasDefensor2[estadistica] = estadisticasDefensorLong.values.elementAt(key)
                    }
                    */
                    val ataque = Ataque(
                        nombre = ataqueDTO.nombre ?: "",
                        manaAtacante = copiaManaAtacante2,
                        estadisticasDefensor = copiaEstadisticasDefensor2,
                        owner = personajeGuardado,
                        dadoBase = ataqueDTO.dadoBase,
                        ratioDado = ataqueDTO.ratioDado
                    )
                    ataqueRepo.save(ataque)
                    personajeGuardado.ataques.add(ataque)
                }

                // Guardar el Personaje actualizado
                personajeRepo.save(personajeGuardado)

                // Actualizar el JugadorJuego con el Personaje
                jugadorJuegoGuardado.personaje = personajeGuardado
                jugadorJuegoRepo.save(jugadorJuegoGuardado)
            }

            // Agregar el JugadorJuego al Juego
            juegoGuardado.jugadores.add(jugadorJuegoGuardado)
        }
        val guardado = juegoRepo.save(juegoGuardado)
        val devolver = PartidaDto(
            id = guardado.id,
            nombre = guardado.nombre,
            descripcion = guardado.descripcion,
            idioma = guardado.idioma,
            maximoJugadores = guardado.maximoJugadores,
        )
        // Guardar el Juego final con todos los jugadores
        return devolver
    }
     */

}