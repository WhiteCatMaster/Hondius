package org.example.backend.service

import org.example.backend.dto.CrearCombateDto
import org.example.backend.entity.Ataque
import org.example.backend.entity.Usuario
import org.example.backend.entity.JugadorJuego
import org.example.backend.entity.Personaje
import org.example.backend.entity.Combate
import org.example.backend.entity.Estadistica
import org.example.backend.entity.Juego
import org.example.backend.entity.RolJugador
import org.example.backend.repository.CombateRepository
import org.example.backend.repository.JuegoRepository
import org.example.backend.repository.JugadorJuegoRepository
import org.example.backend.repository.PersonajeRepository
import org.example.backend.repository.UsuarioRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import kotlin.collections.mutableListOf

class CombateServiceTests {
    private val combateRepo: CombateRepository = mock<CombateRepository>()
    private val juegoRepo: JuegoRepository = mock<JuegoRepository>()
    private val personajeRepo: PersonajeRepository = mock<PersonajeRepository>()
    private val jugadorJuegoRepo: JugadorJuegoRepository = mock<JugadorJuegoRepository>()
    private val usuarioRepo: UsuarioRepository = mock<UsuarioRepository>()
    private val combateService = CombateService(combateRepo,juegoRepo,personajeRepo,jugadorJuegoRepo,usuarioRepo)


    @Test
    fun testCrearCombatexDTO() {
        // 1. ARRANGE: Instanciamos los DTOs de entrada reales (sin mocks)

        val jugadorUnoDto = CrearCombateDto.JugadorDto(10L, 20L, "ADMIN", 100L)
        val jugadorDosDto = CrearCombateDto.JugadorDto(11L, 21L, "JUGADOR", 101L)
        val crearCombateDto = CrearCombateDto(1L, "batalla epica", jugadorUnoDto, jugadorDosDto, 1000L)

        // 2. ARRANGE: Preparamos las entidades falsas que devolverá la base de datos
        // Usamos mocks para las entidades devueltas y así nos saltamos sus constructores
        val partidaMock = mock<Juego> { on { id } doReturn 1000L }
        val personaje1Mock = mock<Personaje> { on { id } doReturn 100L }
        val personaje2Mock = mock<Personaje> { on { id } doReturn 101L }

        // El usuario guardado debe tener la lista inicializada para que el service pueda hacer .add()
        val usuarioGuardadoMock = mock<Usuario> {
            on { id } doReturn 1L
            on { partidasParticipa } doReturn mutableListOf()
        }

        val jugadorJuego1Mock = mock<JugadorJuego> {
            on { id } doReturn 10L
            on { rol } doReturn RolJugador.ADMIN
            on { personaje } doReturn personaje1Mock
        }
        val jugadorJuego2Mock = mock<JugadorJuego> {
            on { id } doReturn 11L
            on { rol } doReturn RolJugador.JUGADOR
            on { personaje } doReturn personaje2Mock
        }

        val combateGuardadoMock = mock<Combate> {
            on { id } doReturn 1L
            on { nombre } doReturn "batalla epica"
            on { jugador1 } doReturn jugadorJuego1Mock
            on { jugador2 } doReturn jugadorJuego2Mock
            on { juego } doReturn partidaMock
        }

        val usuarioFalso1 = Usuario(20L,"google_id", "anEmail@mail.com","UsuarioUno","fotoUsuario.url",mutableListOf())
        val usuarioFalso2 = Usuario(21L,"google_id2", "anEmail@mail.com","UsuarioDos","fotoUsuario.url",mutableListOf())
        // 3. ARRANGE: Configuramos los comportamientos de los repositorios
        // Como el service usa .get() después del findById, debemos devolver un Optional
        whenever(juegoRepo.findById(1000L)).thenReturn(java.util.Optional.of(partidaMock))
        whenever(usuarioRepo.save(any())).thenReturn(usuarioGuardadoMock)
        whenever(jugadorJuegoRepo.save(any())).thenAnswer { invocation ->
            // Capturamos el objeto que intentan guardar y le indicamos su clase
            val entidad = invocation.arguments[0] as JugadorJuego

            entidad
        }

        whenever(personajeRepo.findById(100L)).thenReturn(java.util.Optional.of(personaje1Mock))
        whenever(personajeRepo.findById(101L)).thenReturn(java.util.Optional.of(personaje2Mock))
        whenever(usuarioRepo.findById(20L)).thenReturn(java.util.Optional.of(usuarioFalso1))
        whenever(usuarioRepo.findById(21L)).thenReturn(java.util.Optional.of(usuarioFalso2))

        whenever(jugadorJuegoRepo.saveAll(any<List<JugadorJuego>>())).thenReturn(listOf(jugadorJuego1Mock, jugadorJuego2Mock))
        whenever(combateRepo.save(any())).thenReturn(combateGuardadoMock)


        // 4. ACT: Llamamos al metodo
        val resultado = combateService.crearCombatexDTO(crearCombateDto)

        // 5. ASSERT: Verificamos los resultados
        assertEquals(1L, resultado.id)
        assertEquals("batalla epica", resultado.nombre)
        assertEquals(10L, resultado.jugador1.id)
        assertEquals(11L, resultado.jugador2.id)

        verify(jugadorJuegoRepo, times(2)).save(any())
        verify(combateRepo).save(any())
    }
    @Test
    fun testObtenerCombateById_Exito() {
        // 1. ARRANGE: Preparamos los mocks para las claves de los mapas
        // Asumo que las claves son de tipo Estadistica, ya que llamas a `j.nombre`
        val estadisticaFuerzaMock = mock<Estadistica> { on { nombre } doReturn "Fuerza" }
        val estadisticaDefensaMock = mock<Estadistica> { on { nombre } doReturn "Defensa" }

        // Preparamos la estadística y ataque para el Jugador 1
        val est1Mock = mock<Estadistica> {
            on { id } doReturn 1L
            on { nombre } doReturn "Vida"
            on { valor } doReturn 100
            on { consumible } doReturn false
        }

        val ataque1Mock = mock<Ataque> {
            on { id } doReturn 1L
            on { nombre } doReturn "Espadazo"
            on { manaAtacante } doReturn mutableMapOf(estadisticaFuerzaMock to 10)
            on { estadisticasDefensor } doReturn mutableMapOf(estadisticaDefensaMock to 5.0)
            on { dadoBase } doReturn 20
            on { ratioDado } doReturn mutableListOf(1, 2)
            on { danioAtaque } doReturn 15
        }

        // Mockeamos los personajes y les asignamos las listas
        val personaje1Mock = mock<Personaje> {
            on { nombre } doReturn "Héroe"
            on { vida } doReturn 100
            on { fotoUrl } doReturn "url_heroe"
            on { estadisticas } doReturn mutableListOf(est1Mock)
            on { ataques } doReturn mutableListOf(ataque1Mock)
        }

        // Para el jugador 2, usamos listas vacías para comprobar que no rompe el código
        val personaje2Mock = mock<Personaje> {
            on { nombre } doReturn "Villano"
            on { vida } doReturn 200
            on { estadisticas } doReturn mutableListOf()
            on { ataques } doReturn mutableListOf()
        }

        // Mockeamos los jugadores
        val jugador1Mock = mock<JugadorJuego> {
            on { id } doReturn 10L
            on { personaje } doReturn personaje1Mock
        }
        val jugador2Mock = mock<JugadorJuego> {
            on { id } doReturn 11L
            on { personaje } doReturn personaje2Mock
        }

        // Mockeamos el combate final
        val combateMock = mock<Combate> {
            on { id } doReturn 1L
            on { jugador1 } doReturn jugador1Mock
            on { jugador2 } doReturn jugador2Mock
        }

        // Configuramos el repositorio
        whenever(combateRepo.findById(1L)).thenReturn(java.util.Optional.of(combateMock))

        // 2. ACT: Llamamos al metodo
        val resultado = combateService.obtenerCombateById(1L)

        // 3. ASSERT: Verificamos que el mapeo se ha hecho correctamente
        assertEquals(200, resultado.statusCode.value())

        val body = resultado.body!!
        assertEquals(1L, body.id)

        // Verificamos el Jugador 1 (que tiene datos)
        assertEquals("Héroe", body.personaje1.personajeNombre)
        assertEquals(1, body.personaje1.personajeEstadisticas.size)
        assertEquals("Vida", body.personaje1.personajeEstadisticas[0].nombre)

        assertEquals(1, body.personaje1.personajeAtaques.size)
        assertEquals("Espadazo", body.personaje1.personajeAtaques[0].nombre)
        // Verificamos que el mapa extrajo la clave correctamente
        assertEquals(10, body.personaje1.personajeAtaques[0].manaAtacante["Fuerza"])
        assertEquals(5.0, body.personaje1.personajeAtaques[0].estadisticasDefensor["Defensa"])

        // Verificamos el Jugador 2 (vacío)
        assertEquals("Villano", body.personaje2.personajeNombre)
        assertEquals(0, body.personaje2.personajeEstadisticas.size)
    }

    @Test
    fun testObtenerCombateById_NoEncontrado() {
        // 1. ARRANGE: El repositorio devuelve vacío
        whenever(combateRepo.findById(99L)).thenReturn(java.util.Optional.empty())

        // 2 & 3. ACT & ASSERT: Esperamos que lance NoSuchElementException por culpa del .get()
        org.junit.jupiter.api.assertThrows<NoSuchElementException> {
            combateService.obtenerCombateById(99L)
        }
    }
}
