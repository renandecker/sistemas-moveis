package com.moveis.service;

import com.moveis.dto.*;
import com.moveis.entity.*;
import com.moveis.repository.FornecedorRepository;
import com.moveis.repository.LancamentoFinanceiroRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ApplicationScoped
public class FluxoCaixaService {

    @Inject LancamentoFinanceiroRepository repository;
    @Inject FornecedorRepository fornecedorRepository;

    // ---------- Criação manual ----------

    @Transactional
    public LancamentoFinanceiro criar(LancamentoFinanceiroRequest req) {
        LancamentoFinanceiro l = new LancamentoFinanceiro();
        l.tipo = req.tipo;
        l.categoria = req.categoria;
        l.descricao = req.descricao;
        l.valor = req.valor;
        l.dataVencimento = req.dataVencimento;
        l.formaPagamento = req.formaPagamento;
        l.observacao = req.observacao;

        if (req.fornecedorId != null) {
            Fornecedor fornecedor = fornecedorRepository.findById(req.fornecedorId);
            if (fornecedor == null) throw new NotFoundException("Fornecedor não encontrado.");
            l.fornecedor = fornecedor;
        }

        repository.persist(l);
        return l;
    }

    // ---------- Hooks automáticos ----------

    /** Cria a conta a receber (RECEITA/PENDENTE) referente a uma venda recém-registrada. */
    @Transactional
    public void registrarReceitaDeVenda(Venda venda) {
        LancamentoFinanceiro l = new LancamentoFinanceiro();
        l.tipo = TipoLancamento.RECEITA;
        l.categoria = "VENDA_MOVEL";
        l.descricao = "Venda: " + venda.movel.nome + " (" + venda.quantidade + "x) — " + venda.cliente.nome;
        l.valor = venda.valorTotal;
        l.dataVencimento = venda.dataVenda.toLocalDate();
        l.venda = venda;
        repository.persist(l);
    }

    /** Cria a conta a pagar (DESPESA/PENDENTE) referente a uma entrada de estoque com fornecedor e custo. */
    @Transactional
    public void registrarDespesaDeCompra(MovimentacaoEstoque mov) {
        if (mov.fornecedor == null || mov.custoUnitario == null) return; // sem dados suficientes para gerar a despesa

        LancamentoFinanceiro l = new LancamentoFinanceiro();
        l.tipo = TipoLancamento.DESPESA;
        l.categoria = "COMPRA_MATERIAL";
        l.descricao = "Compra: " + mov.material.nome + " (" + mov.quantidade + " " + mov.material.unidadeMedida + ")";
        l.valor = mov.custoUnitario.multiply(mov.quantidade);
        l.dataVencimento = mov.dataMovimentacao.toLocalDate();
        l.fornecedor = mov.fornecedor;
        repository.persist(l);
    }

    // ---------- Consultas ----------

    public List<LancamentoFinanceiro> listar(TipoLancamento tipo, StatusLancamento status) {
        repository.atualizarAtrasados();
        return repository.filtrar(tipo, status);
    }

    @Transactional
    public LancamentoFinanceiro registrarPagamento(Long id, RegistrarPagamentoRequest req) {
        LancamentoFinanceiro l = repository.findById(id);
        if (l == null) throw new NotFoundException("Lançamento não encontrado.");
        l.status = StatusLancamento.PAGO;
        l.dataPagamento = req != null && req.dataPagamento != null ? req.dataPagamento : LocalDateTime.now();
        if (req != null && req.formaPagamento != null) l.formaPagamento = req.formaPagamento;
        return l;
    }

    @Transactional
    public LancamentoFinanceiro cancelar(Long id) {
        LancamentoFinanceiro l = repository.findById(id);
        if (l == null) throw new NotFoundException("Lançamento não encontrado.");
        l.status = StatusLancamento.CANCELADO;
        return l;
    }

    public ResumoFluxoCaixaDTO resumo(LocalDate inicio, LocalDate fim) {
        repository.atualizarAtrasados();

        LocalDateTime inicioDT = inicio.atStartOfDay();
        LocalDateTime fimDT = fim.atTime(LocalTime.MAX);

        ResumoFluxoCaixaDTO r = new ResumoFluxoCaixaDTO();
        r.periodoInicio = inicio;
        r.periodoFim = fim;

        r.totalRecebido = somar(repository.pagosNoPeriodo(TipoLancamento.RECEITA, inicioDT, fimDT));
        r.totalPago = somar(repository.pagosNoPeriodo(TipoLancamento.DESPESA, inicioDT, fimDT));
        r.saldoPeriodo = r.totalRecebido.subtract(r.totalPago);

        r.totalAReceber = somar(repository.emAberto(TipoLancamento.RECEITA));
        r.totalAPagar = somar(repository.emAberto(TipoLancamento.DESPESA));

        BigDecimal recebidoTotal = somar(repository.pagosTodos(TipoLancamento.RECEITA));
        BigDecimal pagoTotal = somar(repository.pagosTodos(TipoLancamento.DESPESA));
        r.saldoAtual = recebidoTotal.subtract(pagoTotal);

        List<LancamentoFinanceiro> pagosPeriodo = repository.pagosNoPeriodoTodos(inicioDT, fimDT);
        Map<String, BigDecimal> agrupado = new HashMap<>();
        Map<String, TipoLancamento> tipoPorCategoria = new HashMap<>();
        for (LancamentoFinanceiro l : pagosPeriodo) {
            agrupado.merge(l.categoria, l.valor, BigDecimal::add);
            tipoPorCategoria.put(l.categoria, l.tipo);
        }
        r.porCategoria = agrupado.entrySet().stream()
                .map(e -> new CategoriaResumoDTO(e.getKey(), tipoPorCategoria.get(e.getKey()), e.getValue()))
                .sorted((a, b) -> b.total.compareTo(a.total))
                .collect(Collectors.toList());

        return r;
    }

    private BigDecimal somar(List<LancamentoFinanceiro> lancamentos) {
        return lancamentos.stream().map(l -> l.valor).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
