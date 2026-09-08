package com.moveis.repository;

import com.moveis.entity.OrdemMontagem;
import com.moveis.entity.StatusOrdem;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class OrdemMontagemRepository implements PanacheRepository<OrdemMontagem> {

    public List<OrdemMontagem> findByStatus(StatusOrdem status) {
        return list("status", status);
    }
}
