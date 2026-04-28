package org.example.backend.service

import jakarta.transaction.Transactional
import org.example.backend.dto.CombatePersonajesDto
import org.example.backend.dto.CrearCombateDto
import org.example.backend.dto.CrearPartidaDto
import org.example.backend.dto.DatosPartidaDto
import org.example.backend.entity.Combate
import org.example.backend.entity.Juego
import org.example.backend.entity.JugadorJuego
import org.example.backend.entity.Usuario
import org.example.backend.repository.CombateRepository
import org.example.backend.repository.JuegoRepository
import org.example.backend.repository.JugadorJuegoRepository
import org.example.backend.repository.PersonajeRepository
import org.example.backend.repository.UsuarioRepository
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service

@Service
class CombateService (
    private val combateRepo: CombateRepository,
    private val juegoRepo: JuegoRepository,
    private val personajeRepo: PersonajeRepository,
    private val jugadorJuegoRepo: JugadorJuegoRepository,
    private val usuarioRepo: UsuarioRepository
){
    @Transactional
    fun crearCombatexDTO(combateDTO: CrearCombateDto): CrearCombateDto {
        val partida = juegoRepo.findById(combateDTO.juegoId).get()
        //Deberia de crear 2 nuevos jugador juego para que el admin tambien pueda jugar con el mismo usuario pero en modo jugador
        val jugadorjuego1 = JugadorJuego(
            usuario = usuarioRepo.findById(combateDTO.jugador1.usuarioId?: -1L).get(),
            juego = partida,
            rol = enumValueOf(combateDTO.jugador1.rol),
            personaje = personajeRepo.findById(combateDTO.jugador1.personajeId).get()
        )
        val jugadorjuego2 = JugadorJuego(
            usuario = usuarioRepo.findById(combateDTO.jugador2.usuarioId?: -1L).get(),
            juego = partida,
            rol = enumValueOf(combateDTO.jugador2.rol),
            personaje = personajeRepo.findById(combateDTO.jugador2.personajeId).get()
        )
        val jugadorjuego1Guardado =jugadorJuegoRepo.save(jugadorjuego1)
        val jugadorjuego2Guardado = jugadorJuegoRepo.save(jugadorjuego2)

        // Mantenemos la coherencia bidireccional en memoria
        //usuarioGuardado.partidasParticipa.add(jugadorJuegoModelo1)
        //usuarioGuardado.partidasParticipa.add(jugadorJuegoModelo2)

        // ¡IMPORTANTE! Guardamos los jugadores para que tengan ID
        //val jugadoresGuardados = jugadorJuegoRepo.saveAll(listOf(jugadorJuegoModelo1, jugadorJuegoModelo2))

        // 3. CREAR Y GUARDAR EL NIETO (Depende de los hijos)
        val combateCreado = Combate(
            nombre = combateDTO.nombre,
            jugador1 = jugadorjuego1Guardado, // Usamos los que ya tienen ID
            jugador2 = jugadorjuego2Guardado, // Usamos los que ya tienen ID
            juego = partida
        )

        // Ahora sí, Hibernate guardará el combate sin quejarse
        val combateGuardado = combateRepo.save(combateCreado)

        // --- El resto de tu código de mapeo de DTO sigue igual ---
        val usuario1Id = combateGuardado.jugador1.usuario?.id
        val usuario2Id = combateGuardado.jugador2.usuario?.id
        val jugador1 = CrearCombateDto.JugadorDto(
            id = combateGuardado.jugador1.id ?: -1,
            usuarioId = usuario1Id,
            rol = combateGuardado.jugador1.rol.toString(),
            personajeId = combateGuardado.jugador1.personaje?.id ?: -1 ,
        )

        val jugador2 = CrearCombateDto.JugadorDto(
            id = combateGuardado.jugador2.id ?: -1,
            usuarioId = usuario2Id,
            rol = combateGuardado.jugador2.rol.toString(),
            personajeId = combateGuardado.jugador2.personaje?.id ?: -1,
        )

        return CrearCombateDto(
            id = combateGuardado.id ?: -1,
            nombre = combateGuardado.nombre,
            jugador1 = jugador1,
            jugador2 = jugador2,
            juegoId = combateGuardado.juego.id ?: -1
        )
    }

    fun obtenerCombateById(id: Long): ResponseEntity<CombatePersonajesDto> {
        val combateGuardado = combateRepo.findById(id).get()
        var estadisticas1Dto = mutableListOf<DatosPartidaDto.PersonajeDto.EstadisticaDto>()
        var ataques1Dto = mutableListOf<DatosPartidaDto.PersonajeDto.AtaqueDto>()
        var estadisticas2Dto = mutableListOf<DatosPartidaDto.PersonajeDto.EstadisticaDto>()
        var ataques2Dto = mutableListOf<DatosPartidaDto.PersonajeDto.AtaqueDto>()
        println(combateGuardado.jugador1)
        for(i in combateGuardado.jugador1.personaje?.estadisticas!!){
            val estadistica1Dto = DatosPartidaDto.PersonajeDto.EstadisticaDto(
                id = i.id,
                nombre = i.nombre,
                valor = i.valor,
                consumible = i.consumible
            )
            estadisticas1Dto.add(estadistica1Dto)
        }
        for (i in combateGuardado.jugador1.personaje?.ataques!!){
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
            ataques1Dto.add(ataqueDto)
        }
        val personaje1Dto = DatosPartidaDto.PersonajeDto(
            id = combateGuardado.jugador1?.id,
            personajeNombre = combateGuardado.jugador1.personaje?.nombre,
            personajeVida = combateGuardado.jugador1.personaje?.vida,
            personajeFotoUrl = combateGuardado.jugador1.personaje?.fotoUrl,
            personajeEstadisticas = estadisticas1Dto,
            personajeAtaques = ataques1Dto
        )
        for(i in combateGuardado.jugador2.personaje?.estadisticas!!){
            val estadistica2Dto = DatosPartidaDto.PersonajeDto.EstadisticaDto(
                id = i.id,
                nombre = i.nombre,
                valor = i.valor,
                consumible = i.consumible
            )
            estadisticas2Dto.add(estadistica2Dto)
        }
        for (i in combateGuardado.jugador2.personaje?.ataques!!){
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
            ataques2Dto.add(ataqueDto)
        }
        val personaje2Dto = DatosPartidaDto.PersonajeDto(
            id = combateGuardado.jugador2?.id,
            personajeNombre = combateGuardado.jugador2.personaje?.nombre,
            personajeVida = combateGuardado.jugador2.personaje?.vida,
            personajeFotoUrl = combateGuardado.jugador2.personaje?.fotoUrl,
            personajeEstadisticas = estadisticas2Dto,
            personajeAtaques = ataques2Dto
        )


        var resultado = CombatePersonajesDto(
            id = combateGuardado.id ?: -1,
            personaje1 = personaje1Dto,
            personaje2 = personaje2Dto
        )
        return ResponseEntity.ok(resultado)
    }
}
