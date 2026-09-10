package com.moveis.repository;

import com.moveis.entity.LancamentoFinanceiro;
import com.moveis.entity.StatusLancamento;
import com.moveis.entity.TipoLancamento;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class LancamentoFinanceiroRepository implements PanacheRepository<LancamentoFinanceiro> {

    public List<LancamentoFinanceiro> filtrar(TipoLancamento tipo, StatusLancamento status) {
        if (tipo == null && status == null) {
            return listAll(Sort.descending("dataVencimento"));
        }
        if (tipo != null && status != null) {
            return list("tipo = ?1 and status = ?2", Sort.descending("dataVencimento"), tipo, status);
        }
        if (tipo != null) {
            return list("tipo", Sort.descending("dataVencimento"), tipo);
        }
        return list("status", Sort.descending("dataVencimento"), status);
    }

    public List<LancamentoFinanceiro> pagosNoPeriodo(TipoLancamento tipo, LocalDateTime inicio, LocalDateTime fim) {
        return list("tipo = ?1 and status = ?2 and dataPagamento between ?3 and ?4",
                tipo, StatusLancamento.PAGO, inicio, fim);
    }

    public List<LancamentoFinanceiro> pagosNoPeriodoTodos(LocalDateTime inicio, LocalDateTime fim) {
        return list("status = ?1 and dataPagamento between ?2 and ?3", StatusLancamento.PAGO, inicio, fim);
    }

    public List<LancamentoFinanceiro> emAberto(TipoLancamento tipo) {
        return list("tipo = ?1 and status in (?2, ?3)", tipo, StatusLancamento.PENDENTE, StatusLancamento.ATRASADO);
    }

    public List<LancamentoFinanceiro> pagosTodos(TipoLancamento tipo) {
        return list("tipo = ?1 and status = ?2", tipo, StatusLancamento.PAGO);
    }

    /** Marca como ATRASADO todo lançamento PENDENTE cujo vencimento já passou. */
    @Transactional
    public void atualizarAtrasados() {
        update("status = ?1 where status = ?2 and dataVencimento < ?3",
                StatusLancamento.ATRASADO, StatusLancamento.PENDENTE, LocalDate.now());
    }
}
