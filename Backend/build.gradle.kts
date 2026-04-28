plugins {
    kotlin("jvm") version "2.2.21"
    kotlin("plugin.spring") version "2.2.21"
    id("org.jetbrains.kotlin.plugin.jpa") version "2.3.20"
    id("org.springframework.boot") version "4.0.3"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "org.example"
version = "0.0.1-SNAPSHOT"
description = "Backend"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}


dependencies {
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-data-rest")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("io.micrometer:micrometer-registry-prometheus")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("tools.jackson.module:jackson-module-kotlin")
    implementation("com.google.firebase:firebase-admin:9.2.0")
    runtimeOnly("com.h2database:h2")
    runtimeOnly("com.mysql:mysql-connector-j")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.mockito.kotlin:mockito-kotlin:5.2.1")
}


kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property")
    }
}

// 1. Configuración de la tarea 'test' por defecto (Solo Unitarias)
tasks.named<Test>("test") {
    description = "Ejecuta las pruebas unitarias."
    useJUnitPlatform()

    // Ignora todo lo que esté dentro de la carpeta 'integration'
    exclude("**/integration/**")
}

// 2. Creación de una nueva tarea dedicada a la Integración
tasks.register<Test>("integrationTest") {
    description = "Ejecuta las pruebas de integración."
    group = "verification"
    useJUnitPlatform()

    testClassesDirs = sourceSets["test"].output.classesDirs
    classpath = sourceSets["test"].runtimeClasspath

    include("**/integration/**")

    shouldRunAfter("test")
}

tasks.named("check") {
    dependsOn("integrationTest")
}
