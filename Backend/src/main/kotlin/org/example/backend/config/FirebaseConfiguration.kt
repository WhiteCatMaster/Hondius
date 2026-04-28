package org.example.backend.config

import com.google.auth.oauth2.GoogleCredentials
import jakarta.annotation.PostConstruct
import org.springframework.context.annotation.Configuration
import org.springframework.core.io.ClassPathResource
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions


@Configuration
class FirebaseConfiguration {
    @PostConstruct
    fun initFirebase(){
        try {
            val resource = ClassPathResource("firebase-adminsdk.json")
            if (!resource.exists()) {
                println("⚠️ Firebase credentials not found. Firebase will not be initialized.")
                return
            }

            val serviceAccount = resource.inputStream

            val options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build()

            // Evitamos inicializarlo dos veces si el servidor se reinicia
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options)
            }
            println("✅ Firebase initialized successfully")

        } catch (e: Exception) {
            e.printStackTrace()
            println("❌ Error initializing Firebase: ${e.message}")
        }
    }

}
