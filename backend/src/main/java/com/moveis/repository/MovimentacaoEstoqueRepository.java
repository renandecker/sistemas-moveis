package com.moveis.repository;

import com.moveis.entity.MovimentacaoEstoque;
import com.moveis.entity.TipoMovimentacao;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class MovimentacaoEstoqueRepository implements PanacheRepository<MovimentacaoEstoque> {

    public List<MovimentacaoEstoque> findByMaterialId(Long materialId) {
        return list("material.id = ?1 order by dataMovimentacao desc", materialId);
    }

    public List<MovimentacaoEstoque> findByTipo(TipoMovimentacao tipo) {
        return list("tipo = ?1 order by dataMovimentacao desc", tipo);
    }

    public List<MovimentacaoEstoque> listarTodasOrdenadas() {
        return list("order by dataMovimentacao desc");
    }
}
