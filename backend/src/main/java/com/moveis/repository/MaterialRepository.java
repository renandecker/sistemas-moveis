package com.moveis.repository;

import com.moveis.entity.Material;
import com.moveis.entity.TipoMaterial;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class MaterialRepository implements PanacheRepository<Material> {

    public Optional<Material> findBySku(String sku) {
        return find("sku", sku).firstResultOptional();
    }

    public List<Material> findByTipo(TipoMaterial tipo) {
        return list("tipo", tipo);
    }

    public List<Material> abaixoDoEstoqueMinimo() {
        return list("estoqueAtual < estoqueMinimo");
    }
}
