package org.example.backend.unit.facade

import org.example.backend.entity.Ataque
import org.example.backend.entity.Estadistica
import org.example.backend.entity.Personaje
import org.example.backend.facade.PersonajeController
import org.example.backend.service.PersonajeService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(PersonajeController::class)
class PersonajeControllerTest {

    @Autowired
    lateinit var mockMvc: MockMvc

    @MockitoBean
    lateinit var personajeService: PersonajeService

    @Test
    fun `obtenerPersonajeById mapea correctamente un personaje completo a DTO`() {
        // 1. ARRANGE: Preparar datos falsos
        val estFuerzaMock = mock<Estadistica> { on { nombre } doReturn "Fuerza" }
        val estDefensaMock = mock<Estadistica> { on { nombre } doReturn "Defensa" }

        val estadisticaMock = mock<Estadistica> {
            on { id } doReturn 1L
            on { nombre } doReturn "Vida"
            on { valor } doReturn 100
            on { consumible } doReturn false
        }

        val ataqueMock = mock<Ataque> {
            on { id } doReturn 1L
            on { nombre } doReturn "Espadazo"
            on { manaAtacante } doReturn mutableMapOf(estFuerzaMock to 10)
            on { estadisticasDefensor } doReturn mutableMapOf(estDefensaMock to 5.0)
            on { dadoBase } doReturn 20
            on { ratioDado } doReturn mutableListOf(1, 2)
            on { danioAtaque } doReturn 15
        }

        val personajeMock = mock<Personaje> {
            on { id } doReturn 10L
            on { nombre } doReturn "Guerrero"
            on { vida } doReturn 150
            on { fotoUrl } doReturn "http://test.com/foto.jpg"
            on { estadisticas } doReturn mutableListOf(estadisticaMock)
            on { ataques } doReturn mutableListOf(ataqueMock)
        }

        whenever(personajeService.getPersonajeById(10L)).thenReturn(personajeMock)

        // 2 & 3. ACT & ASSERT: Llamada HTTP y verificación de la estructura JSON
        mockMvc.perform(
            get("/personaje/10")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(10))
            .andExpect(jsonPath("$.personajeNombre").value("Guerrero"))
            .andExpect(jsonPath("$.personajeVida").value(150))
            .andExpect(jsonPath("$.personajeFotoUrl").value("http://test.com/foto.jpg"))

            // Verificación de la lista de estadísticas
            .andExpect(jsonPath("$.personajeEstadisticas[0].nombre").value("Vida"))
            .andExpect(jsonPath("$.personajeEstadisticas[0].valor").value(100))

            // Verificación de la lista de ataques y sus diccionarios internos
            .andExpect(jsonPath("$.personajeAtaques[0].nombre").value("Espadazo"))
            .andExpect(jsonPath("$.personajeAtaques[0].manaAtacante.Fuerza").value(10))
            .andExpect(jsonPath("$.personajeAtaques[0].estadisticasDefensor.Defensa").value(5.0))
            .andExpect(jsonPath("$.personajeAtaques[0].dadoBase").value(20))
    }

    @Test
    fun `obtenerPersonajeById lanza excepcion si el personaje no existe`() {
        // 1. ARRANGE: El servicio devuelve null
        whenever(personajeService.getPersonajeById(99L)).thenReturn(null)

        // 2 & 3. ACT & ASSERT: Esperamos que falle por un NullPointerException
        try {
            mockMvc.perform(get("/personaje/99"))
        } catch (e: Exception) {
            // Spring MVC envuelve las excepciones internas en un NestedServletException
            assert(e.cause is NullPointerException)
        }
    }
}