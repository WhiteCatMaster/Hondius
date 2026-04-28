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
            val serviceAccount = ClassPathResource("firebase-adminsdk.json").inputStream

            val options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build()

            // Evitamos inicializarlo dos veces si el servidor se reinicia
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options)
            }


        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

}
