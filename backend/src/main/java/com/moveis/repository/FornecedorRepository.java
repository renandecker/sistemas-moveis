package com.moveis.repository;

import com.moveis.entity.Fornecedor;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;

@ApplicationScoped
public class FornecedorRepository implements PanacheRepository<Fornecedor> {

    public Optional<Fornecedor> findByCnpj(String cnpj) {
        return find("cnpj", cnpj).firstResultOptional();
    }
}
