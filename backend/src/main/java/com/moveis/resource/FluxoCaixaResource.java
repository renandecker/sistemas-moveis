package com.moveis.resource;

import com.moveis.dto.*;
import com.moveis.entity.LancamentoFinanceiro;
import com.moveis.entity.StatusLancamento;
import com.moveis.entity.TipoLancamento;
import com.moveis.service.FluxoCaixaService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Path("/api/fluxo-caixa")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FluxoCaixaResource {

    @Inject FluxoCaixaService fluxoCaixaService;

    @GET
    @Path("/lancamentos")
    public List<LancamentoFinanceiroDTO> listar(@QueryParam("tipo") TipoLancamento tipo,
                                                 @QueryParam("status") StatusLancamento status) {
        return fluxoCaixaService.listar(tipo, status).stream()
                .map(LancamentoFinanceiroDTO::from).collect(Collectors.toList());
    }

    @POST
    @Path("/lancamentos")
    public Response criar(@Valid LancamentoFinanceiroRequest req) {
        LancamentoFinanceiro l = fluxoCaixaService.criar(req);
        return Response.status(Response.Status.CREATED).entity(LancamentoFinanceiroDTO.from(l)).build();
    }

    @PATCH
    @Path("/lancamentos/{id}/pagar")
    public Response registrarPagamento(@PathParam("id") Long id, RegistrarPagamentoRequest req) {
        LancamentoFinanceiro l = fluxoCaixaService.registrarPagamento(id, req);
        return Response.ok(LancamentoFinanceiroDTO.from(l)).build();
    }

    @PATCH
    @Path("/lancamentos/{id}/cancelar")
    public Response cancelar(@PathParam("id") Long id) {
        LancamentoFinanceiro l = fluxoCaixaService.cancelar(id);
        return Response.ok(LancamentoFinanceiroDTO.from(l)).build();
    }

    @GET
    @Path("/resumo")
    public ResumoFluxoCaixaDTO resumo(@QueryParam("inicio") String inicio, @QueryParam("fim") String fim) {
        LocalDate dataInicio = inicio != null ? LocalDate.parse(inicio) : LocalDate.now().withDayOfMonth(1);
        LocalDate dataFim = fim != null ? LocalDate.parse(fim) : LocalDate.now();
        return fluxoCaixaService.resumo(dataInicio, dataFim);
    }
}
