package com.moveis.repository;

import com.moveis.entity.Venda;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class VendaRepository implements PanacheRepository<Venda> {

    public List<Venda> findByClienteId(Long clienteId) {
        return list("cliente.id = ?1 order by dataVenda desc", clienteId);
    }
}
