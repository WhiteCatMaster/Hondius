package org.example.backend.repository

import org.example.backend.entity.ObjetoCompleto
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ObjetoCompletoRepository : JpaRepository<ObjetoCompleto, Long>