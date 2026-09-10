package com.moveis.service;

import com.moveis.dto.MovimentacaoEstoqueRequest;
import com.moveis.entity.*;
import com.moveis.repository.FornecedorRepository;
import com.moveis.repository.MaterialRepository;
import com.moveis.repository.MovimentacaoEstoqueRepository;
import com.moveis.repository.OrdemMontagemRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

/**
 * Centraliza o registro de entradas e saídas de estoque, mantendo
 * `materiais.estoque_atual` sempre consistente com o histórico de
 * movimentações.
 */
@ApplicationScoped
public class EstoqueService {

    @Inject MaterialRepository materialRepository;
    @Inject FornecedorRepository fornecedorRepository;
    @Inject OrdemMontagemRepository ordemMontagemRepository;
    @Inject MovimentacaoEstoqueRepository movimentacaoRepository;
    @Inject FluxoCaixaService fluxoCaixaService;

    @Transactional
    public MovimentacaoEstoque registrarMovimentacao(MovimentacaoEstoqueRequest req) {
        Material material = materialRepository.findById(req.materialId);
        if (material == null) {
            throw new NotFoundException("Material não encontrado.");
        }

        MovimentacaoEstoque mov = new MovimentacaoEstoque();
        mov.material = material;
        mov.tipo = req.tipo;
        mov.quantidade = req.quantidade;
        mov.custoUnitario = req.custoUnitario;
        mov.observacao = req.observacao;

        if (req.fornecedorId != null) {
            Fornecedor fornecedor = fornecedorRepository.findById(req.fornecedorId);
            if (fornecedor == null) throw new NotFoundException("Fornecedor não encontrado.");
            mov.fornecedor = fornecedor;
        }

        if (req.ordemMontagemId != null) {
            OrdemMontagem ordem = ordemMontagemRepository.findById(req.ordemMontagemId);
            if (ordem == null) throw new NotFoundException("Ordem de montagem não encontrada.");
            mov.ordemMontagem = ordem;
        }

        if (req.tipo == TipoMovimentacao.ENTRADA) {
            material.estoqueAtual = material.estoqueAtual.add(req.quantidade);
            if (req.custoUnitario != null) {
                material.custoUnitario = req.custoUnitario;
            }
        } else {
            if (material.estoqueAtual.compareTo(req.quantidade) < 0) {
                throw new BadRequestException(
                        "Estoque insuficiente para saída: disponível " + material.estoqueAtual
                                + " " + material.unidadeMedida + ", solicitado " + req.quantidade + ".");
            }
            material.estoqueAtual = material.estoqueAtual.subtract(req.quantidade);
        }

        movimentacaoRepository.persist(mov);

        if (req.tipo == TipoMovimentacao.ENTRADA) {
            fluxoCaixaService.registrarDespesaDeCompra(mov);
        }

        return mov;
    }
}
