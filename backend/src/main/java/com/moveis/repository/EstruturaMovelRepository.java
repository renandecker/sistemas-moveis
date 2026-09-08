package com.moveis.repository;

import com.moveis.entity.EstruturaMovel;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class EstruturaMovelRepository implements PanacheRepository<EstruturaMovel> {

    public List<EstruturaMovel> findByMovelId(Long movelId) {
        return list("movel.id", movelId);
    }
}
