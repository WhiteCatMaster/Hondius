package org.example.backend.service

import org.example.backend.dto.CrearPartidaDto
import org.example.backend.entity.Juego
import org.example.backend.entity.JugadorJuego
import org.example.backend.repository.AtaqueRepository
import org.example.backend.repository.EstadisticaRepository
import org.example.backend.repository.JuegoRepository
import org.example.backend.repository.JugadorJuegoRepository
import org.example.backend.repository.PersonajeRepository
import org.example.backend.repository.UsuarioRepository
import org.example.backend.entity.Ataque
import org.example.backend.entity.Estadistica
import org.example.backend.entity.Personaje
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.atLeastOnce
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.aot.hint.TypeReference.listOf
import java.util.Optional

class JuegoServiceTests {

    private val juegoRepository: JuegoRepository = mock<JuegoRepository>()
    private val usuarioRepository: UsuarioRepository = mock<UsuarioRepository>()
    private val jugadorJuegoRepository: JugadorJuegoRepository = mock<JugadorJuegoRepository>()
    private val personajeRepository: PersonajeRepository = mock<PersonajeRepository>()
    private val estadisticaRepository: EstadisticaRepository = mock<EstadisticaRepository>()
    private val ataqueRepository: AtaqueRepository = mock<AtaqueRepository>()
    private val estadisticaService = EstadisticaService(estadisticaRepository)
    private val juegoService = JuegoService(juegoRepository,usuarioRepository,jugadorJuegoRepository,personajeRepository,estadisticaRepository,ataqueRepository, estadisticaService)

    @Test
    fun testGetAllPartidas() {
        //Debería devolver una lista con las dos partidas falsificadas
        val listaFalsa = listOf(
            Juego(1L,"Partida primera","Una partida muy chula", "ES",4,mutableListOf()),
                    Juego(1L,"Partida segunda","Una partida muy aburrida", "EN",6,mutableListOf())
        )
        whenever(juegoRepository.findAll()).thenReturn(listaFalsa)

        val resultado = juegoService.getAllPartidas()

        assertEquals(2, resultado.size)
        assertEquals("Partida primera", resultado[0].nombre)
        verify(juegoRepository).findAll()
    }
    @Test
    fun testGetAllJuegos() {
        val listaFalsa = listOf(
            Juego(1L, "Juego 1", "Desc 1", "ES", 4, mutableListOf()),
            Juego(2L, "Juego 2", "Desc 2", "EN", 2, mutableListOf())
        )
        whenever(juegoRepository.findAll()).thenReturn(listaFalsa)

        val resultado = juegoService.getAllJuegos()

        assertEquals(2, resultado.size)
        verify(juegoRepository).findAll()
    }
    @Test
    fun testCreateJuego() {
        val nuevoJuego = Juego(null, "Nuevo", "Desc", "ES", 4, mutableListOf())
        val juegoGuardado = Juego(1L, "Nuevo", "Desc", "ES", 4, mutableListOf())

        whenever(juegoRepository.save(nuevoJuego)).thenReturn(juegoGuardado)

        val resultado = juegoService.createJuego(nuevoJuego)

        assertEquals(1L, resultado.id)
        verify(juegoRepository).save(nuevoJuego)
    }

    @Test
    fun testEliminarJuego() {
        juegoService.eliminarJuego(1L)
        verify(juegoRepository).deleteById(1L)
    }

    @Test
    fun testAsignarJugadorJuego() {
        val juegoExistente = Juego(1L, "Partida", "Desc", "ES", 4, mutableListOf())
        val nuevoJugador = JugadorJuego() // Asumiendo constructor vacío o con defaults para el test

        whenever(juegoRepository.findById(1L)).thenReturn(Optional.of(juegoExistente))
        whenever(juegoRepository.save(juegoExistente)).thenReturn(juegoExistente)

        val resultado = juegoService.asignarJugadorJuego(1L, nuevoJugador)

        assertEquals(1, resultado?.jugadores?.size)
        verify(juegoRepository).findById(1L)
        verify(juegoRepository).save(juegoExistente)
    }

    @Test
    fun testModificarJuegoInexistente() {
        val juegoActualizado = Juego(null, "Cambio", "Desc", "ES", 4, mutableListOf())

        // Simulamos que no se encuentra en la BD
        whenever(juegoRepository.findById(99L)).thenReturn(Optional.empty())

        val resultado = juegoService.modificarJuego(99L, juegoActualizado)

        assertEquals(null, resultado)
        verify(juegoRepository).findById(99L)
        // Comprobación de seguridad: Nunca debe intentar guardar si no existe
        verify(juegoRepository, never()).save(any())
    }

    @Test
    fun testCambiarIdiomaJuego() {
        val juegoExistente = Juego(1L, "Partida", "Desc", "ES", 4, mutableListOf())

        whenever(juegoRepository.findById(1L)).thenReturn(Optional.of(juegoExistente))
        whenever(juegoRepository.save(juegoExistente)).thenReturn(juegoExistente)

        val resultado = juegoService.cambiarIdiomaJuego(1L, "English")

        assertEquals("English", resultado?.idioma)
        verify(juegoRepository).findById(1L)
        verify(juegoRepository).save(juegoExistente)
    }

    @Test
    fun testCrearJuegoxDTO() {

        val estatDto = CrearPartidaDto.PersonajeDto.EstadisticaDto("Fuerza", 8, false)
        val ataqueDto = CrearPartidaDto.PersonajeDto.AtaqueDto(
            nombre = "Golpe",
            dadoBase = 10,
            ratioDado = listOf(1, 2) as MutableList<Int>,
            estadisticasDefensor = mapOf("Fuerza" to 2.0) as MutableMap<String, Double>,
            manaAtacante = mapOf("Fuerza" to 1) as MutableMap<String, Int>
        )
        val personajeDto = CrearPartidaDto.PersonajeDto(
            personajeNombre = "Paco",
            personajeVida = 100,
            personajeFotoUrl = "url",
            personajeEstadisticas = listOf(estatDto) as MutableList<CrearPartidaDto.PersonajeDto.EstadisticaDto>,
            personajeAtaques = listOf(ataqueDto) as MutableList<CrearPartidaDto.PersonajeDto.AtaqueDto>
        )

        val partidaDto = CrearPartidaDto(
            nombre = "Partida Test",
            idioma = "ES",
            descripcion = "Desc",
            maximoJugadores = 4,
            jugadores = listOf(personajeDto) as MutableList<CrearPartidaDto.PersonajeDto>
        )

        //Mocks para las llamadas a la BD
        val juegoSimulado = Juego(1L, "Partida Test", "Desc", "ES", 4, mutableListOf())

        whenever(juegoRepository.save(any<Juego>())).thenReturn(juegoSimulado)
        whenever(personajeRepository.saveAll(any<List<Personaje>>())).thenReturn(listOf() as List<Personaje>)
        whenever(estadisticaRepository.saveAll(any<List<Estadistica>>())).thenReturn(listOf() as List<Estadistica>)
        whenever(ataqueRepository.saveAll(any<List<Ataque>>())).thenReturn(listOf() as List<Ataque>)

        val resultado = juegoService.crearJuegoxDTO(partidaDto)

        assertEquals(1L, resultado.id)
        assertEquals("Partida Test", resultado.nombre)

        verify(juegoRepository).save(any<Juego>())
        verify(personajeRepository).saveAll(any<List<Personaje>>())
        verify(estadisticaRepository, atLeastOnce()).saveAll(any<List<Estadistica>>())
        verify(ataqueRepository, atLeastOnce()).saveAll(any<List<Ataque>>())
    }


}