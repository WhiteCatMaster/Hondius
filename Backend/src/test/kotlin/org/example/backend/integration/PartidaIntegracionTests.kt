package org.example.backend.integration
import tools.jackson.databind.ObjectMapper
import org.example.backend.dto.CrearPartidaDto
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.example.backend.entity.Usuario
import org.example.backend.repository.UsuarioRepository
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath

@SpringBootTest
@AutoConfigureMockMvc
class PartidaIntegrationTests {

    // Herramienta principal para lanzar peticiones HTTP simuladas
    @Autowired
    lateinit var mockMvc: MockMvc

    // Herramienta de Spring para convertir DTOs a texto JSON
    @Autowired
    lateinit var objectMapper: ObjectMapper

    // 1. Inyectamos el repositorio real para poder meter datos en la BD de prueba
    @Autowired
    lateinit var usuarioRepo: UsuarioRepository

    @Test
    fun testFlujoCompletoCrearPartida() {
        // --- 0. PREPARACIÓN DE LA BASE DE DATOS ---
        // Creamos un usuario ficticio y lo guardamos para que exista un Admin
        val usuarioFicticio = Usuario(
            googleId = "test-google-id",
            email = "admin@test.com",
            nombre = "Admin Prueba",
            fotoUrl = "url",
            partidasParticipa = mutableListOf()
        )
        val usuarioGuardado = usuarioRepo.save(usuarioFicticio)

        // ¡Magia! La BD en memoria le ha asignado un ID real. Nos lo guardamos.
        val idAdminGenerado = usuarioGuardado.id!!


        // --- 1. PREPARACIÓN DEL DTO ---
        val estadistica = CrearPartidaDto.PersonajeDto.EstadisticaDto(
            nombre = "Vida", valor = 100, consumible = false
        )

        val ataque = CrearPartidaDto.PersonajeDto.AtaqueDto(
            nombre = "Golpe Básico",
            manaAtacante = mutableMapOf("Fuerza" to 10),
            estadisticasDefensor = mutableMapOf("Defensa" to 5.0),
            dadoBase = 10,
            ratioDado = mutableListOf(1),
            danoAtaque = 15
        )

        val personaje = CrearPartidaDto.PersonajeDto(
            personajeNombre = "Heroe Integración",
            personajeVida = 100,
            personajeFotoUrl = "http://test.com/foto.jpg",
            personajeEstadisticas = mutableListOf(estadistica),
            personajeAtaques = mutableListOf(ataque)
        )

        val dtoEntrada = CrearPartidaDto(
            nombre = "Partida Test Integración",
            descripcion = "Probando la base de datos real",
            idioma = "ES",
            maximoJugadores = 4,
            jugadores = mutableListOf(personaje),

            // 2. Usamos el ID real del usuario que acabamos de guardar en la BD
            adminId = idAdminGenerado
        )

        val payload = mapOf("juego" to dtoEntrada)
        val jsonPayload = objectMapper.writeValueAsString(payload)

        // --- 3. EJECUCIÓN HTTP ---
        mockMvc.perform(
            post("/partida")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload)
        )
            .andExpect(status().isCreated)
    }
    @Test
    fun testObtenerPartidaCompleta_EvitaLazyInitializationException() {
        // --- 1. PREPARACIÓN (Igual que en el POST, necesitamos datos en la BD) ---
        val usuarioFicticio = Usuario(
            googleId = "test-google-id-2",
            email = "admin2@test.com",
            nombre = "Admin Prueba 2",
            fotoUrl = "url",
            partidasParticipa = mutableListOf()
        )
        val idAdminGenerado = usuarioRepo.save(usuarioFicticio).id!!

        val estadisticaFuerza = CrearPartidaDto.PersonajeDto.EstadisticaDto(
            nombre = "Fuerza", valor = 100, consumible = false
        )
        val estadisticaDefensa = CrearPartidaDto.PersonajeDto.EstadisticaDto(
            nombre = "Defensa", valor = 50, consumible = false
        )

        // 2. El ataque usa esos mismos nombres
        val ataque = CrearPartidaDto.PersonajeDto.AtaqueDto(
            nombre = "Tajo Mortal",
            manaAtacante = mutableMapOf("Fuerza" to 10),
            estadisticasDefensor = mutableMapOf("Defensa" to 5.0),
            dadoBase = 10,
            ratioDado = mutableListOf(1),
            danoAtaque = 15
        )

        // 3. Añadimos ambas estadísticas al personaje
        val personaje = CrearPartidaDto.PersonajeDto(
            personajeNombre = "Villano Integración",
            personajeVida = 200,
            personajeFotoUrl = "http://test.com/foto_villano.jpg",
            personajeEstadisticas = mutableListOf(estadisticaFuerza, estadisticaDefensa), // <-- Añadidas aquí
            personajeAtaques = mutableListOf(ataque)
        )

        val dtoEntrada = CrearPartidaDto(
            nombre = "Partida Lectura",
            descripcion = "Probando la lectura de datos anidados",
            idioma = "ES",
            maximoJugadores = 2,
            jugadores = mutableListOf(personaje),
            adminId = idAdminGenerado
        )



        // --- 2. GUARDAR LA PARTIDA USANDO EL ENDPOINT POST ---
        val jsonPayload = objectMapper.writeValueAsString(mapOf("juego" to dtoEntrada))

        val respuestaPost = mockMvc.perform(
            post("/partida")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload)
        ).andReturn()

        // Extraemos el ID real de la partida que se acaba de guardar en la base de datos
        // leyendo la respuesta del POST en formato JSON
        val respuestaJson = objectMapper.readTree(respuestaPost.response.contentAsString)
        val idPartidaGenerado = respuestaJson.get("id").asLong()

        // --- 3. PRUEBA CRÍTICA: LECTURA DE LA PARTIDA (GET) ---
        mockMvc.perform(
            get("/partida/$idPartidaGenerado")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isOk) // Esperamos un 200 OK

            // 4. VERIFICACIÓN DE DATOS ANIDADOS
            // Usamos jsonPath para navegar por la estructura del DTO y asegurar que
            // no se ha perdido ningún nivel de profundidad al salir de la base de datos
            .andExpect(jsonPath("$.nombre").value("Partida Lectura"))
            .andExpect(jsonPath("$.jugadores[0].personajeNombre").value("Villano Integración"))
            .andExpect(jsonPath("$.jugadores[0].personajeEstadisticas[0].nombre").value("Fuerza"))
            .andExpect(jsonPath("$.jugadores[0].personajeAtaques[0].nombre").value("Tajo Mortal"))
            .andExpect(jsonPath("$.jugadores[0].personajeAtaques[0].manaAtacante.Fuerza").value(10))
    }
}