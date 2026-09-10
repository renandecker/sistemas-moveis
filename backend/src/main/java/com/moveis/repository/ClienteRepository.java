package com.moveis.repository;

import com.moveis.entity.Cliente;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ClienteRepository implements PanacheRepository<Cliente> {

    public Optional<Cliente> findByCpfCnpj(String cpfCnpj) {
        return find("cpfCnpj", cpfCnpj).firstResultOptional();
    }

    public List<Cliente> buscarPorNome(String termo) {
        return list("lower(nome) like ?1", "%" + termo.toLowerCase() + "%");
    }
}
