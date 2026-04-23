package org.example.backend;

import org.example.backend.dto.CrearPartidaDto
import org.example.backend.entity.Juego
import org.example.backend.entity.JugadorJuego
import org.example.backend.repository.AtaqueRepository
import org.example.backend.repository.EstadisticaRepository
import org.example.backend.repository.JuegoRepository
import org.example.backend.repository.JugadorJuegoRepository
import org.example.backend.repository.PersonajeRepository
import org.example.backend.repository.UsuarioRepository
import org.example.backend.service.EstadisticaService
import org.example.backend.service.JuegoService
import org.example.backend.entity.Ataque
import org.example.backend.entity.Estadistica
import org.example.backend.entity.Personaje
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.springframework.aot.hint.TypeReference.listOf
import java.util.Optional

class JuegoServiceTests {

    private val juegoRepository: JuegoRepository = mock(JuegoRepository::class.java)
    private val usuarioRepository: UsuarioRepository = mock(UsuarioRepository::class.java)
    private val jugadorJuegoRepository: JugadorJuegoRepository = mock(JugadorJuegoRepository::class.java)
    private val personajeRepository: PersonajeRepository = mock(PersonajeRepository::class.java)
    private val estadisticaRepository: EstadisticaRepository = mock(EstadisticaRepository::class.java)
    private val ataqueRepository: AtaqueRepository = mock(AtaqueRepository::class.java)
    private val estadisticaService = EstadisticaService(estadisticaRepository)
    private val juegoService = JuegoService(juegoRepository,usuarioRepository,jugadorJuegoRepository,personajeRepository,estadisticaRepository,ataqueRepository, estadisticaService)

    @Test
    fun testGetAllPartidas() {
        //Debería devolver una lista con las dos partidas falsificadas
        val listaFalsa = listOf(
            Juego(1L,"Partida primera","Una partida muy chula", "ES",4,mutableListOf()),
                    Juego(1L,"Partida segunda","Una partida muy aburrida", "EN",6,mutableListOf())
        )
        `when`(juegoRepository.findAll()).thenReturn(listaFalsa)

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
        `when`(juegoRepository.findAll()).thenReturn(listaFalsa)

        val resultado = juegoService.getAllJuegos()

        assertEquals(2, resultado.size)
        verify(juegoRepository).findAll()
    }
    @Test
    fun testCreateJuego() {
        val nuevoJuego = Juego(null, "Nuevo", "Desc", "ES", 4, mutableListOf())
        val juegoGuardado = Juego(1L, "Nuevo", "Desc", "ES", 4, mutableListOf())

        `when`(juegoRepository.save(nuevoJuego)).thenReturn(juegoGuardado)

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

        `when`(juegoRepository.findById(1L)).thenReturn(Optional.of(juegoExistente))
        `when`(juegoRepository.save(juegoExistente)).thenReturn(juegoExistente)

        val resultado = juegoService.asignarJugadorJuego(1L, nuevoJugador)

        assertEquals(1, resultado?.jugadores?.size)
        verify(juegoRepository).findById(1L)
        verify(juegoRepository).save(juegoExistente)
    }

    @Test
    fun testModificarJuegoInexistente() {
        val juegoActualizado = Juego(null, "Cambio", "Desc", "ES", 4, mutableListOf())

        // Simulamos que no se encuentra en la BD
        `when`(juegoRepository.findById(99L)).thenReturn(Optional.empty())

        val resultado = juegoService.modificarJuego(99L, juegoActualizado)

        assertEquals(null, resultado)
        verify(juegoRepository).findById(99L)
        // Comprobación de seguridad: Nunca debe intentar guardar si no existe
        verify(juegoRepository, org.mockito.Mockito.never()).save(org.mockito.Mockito.any())
    }

    @Test
    fun testCambiarIdiomaJuego() {
        val juegoExistente = Juego(1L, "Partida", "Desc", "ES", 4, mutableListOf())

        `when`(juegoRepository.findById(1L)).thenReturn(Optional.of(juegoExistente))
        `when`(juegoRepository.save(juegoExistente)).thenReturn(juegoExistente)

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

        `when`(juegoRepository.save(org.mockito.Mockito.any(Juego::class.java))).thenReturn(juegoSimulado)
        `when`(personajeRepository.saveAll(org.mockito.Mockito.anyList())).thenReturn(listOf() as List<Personaje?>)
        `when`(estadisticaRepository.saveAll(org.mockito.Mockito.anyList())).thenReturn(listOf() as List<Estadistica?>)
        `when`(ataqueRepository.saveAll(org.mockito.Mockito.anyList())).thenReturn(listOf() as List<Ataque?>)

        val resultado = juegoService.crearJuegoxDTO(partidaDto)

        assertEquals(1L, resultado.id)
        assertEquals("Partida Test", resultado.nombre)

        verify(juegoRepository).save(org.mockito.Mockito.any(Juego::class.java))
        verify(personajeRepository).saveAll(org.mockito.Mockito.anyList())
        verify(estadisticaRepository, org.mockito.Mockito.atLeastOnce()).saveAll(org.mockito.Mockito.anyList())
        verify(ataqueRepository, org.mockito.Mockito.atLeastOnce()).saveAll(org.mockito.Mockito.anyList())
    }


}