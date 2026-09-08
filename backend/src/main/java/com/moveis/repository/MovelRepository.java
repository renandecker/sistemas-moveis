package com.moveis.repository;

import com.moveis.entity.Movel;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;

@ApplicationScoped
public class MovelRepository implements PanacheRepository<Movel> {

    public Optional<Movel> findByCodigo(String codigo) {
        return find("codigo", codigo).firstResultOptional();
    }
}
