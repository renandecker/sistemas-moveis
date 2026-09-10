package com.moveis.repository;

import com.moveis.entity.FornecedorMaterial;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class FornecedorMaterialRepository implements PanacheRepository<FornecedorMaterial> {

    public List<FornecedorMaterial> findByFornecedorId(Long fornecedorId) {
        return list("fornecedor.id", fornecedorId);
    }

    /** Todas as cotações (de qualquer fornecedor) para um material, ordenadas do mais barato pro mais caro. */
    public List<FornecedorMaterial> findByMaterialId(Long materialId) {
        return list("material.id = ?1 order by precoUnitario asc", materialId);
    }

    public Optional<FornecedorMaterial> findByFornecedorEMaterial(Long fornecedorId, Long materialId) {
        return find("fornecedor.id = ?1 and material.id = ?2", fornecedorId, materialId).firstResultOptional();
    }
}
