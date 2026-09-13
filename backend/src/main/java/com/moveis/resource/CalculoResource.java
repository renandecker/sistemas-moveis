package com.moveis.resource;

import com.moveis.dto.CalculoChapaRequest;
import com.moveis.dto.CalculoChapaResponse;
import com.moveis.dto.CalculoFitaBordaRequest;
import com.moveis.dto.CalculoFitaBordaResponse;
import com.moveis.service.CalculoService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Endpoints utilitários para os cálculos da Seção 2 da especificação técnica,
 * independentes de um móvel já cadastrado (simulações rápidas de plano de
 * corte e consumo de fita de borda).
 */
@Path("/api/calculos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CalculoResource {

    @Inject
    CalculoService calculoService;

    @POST
    @Path("/chapas")
    public Response calcularChapas(@Valid CalculoChapaRequest req) {
        CalculoChapaResponse resp = calculoService.calcularChapas(req);
        return Response.ok(resp).build();
    }

    @POST
    @Path("/fita-borda")
    public Response calcularFitaBorda(@Valid CalculoFitaBordaRequest req) {
        CalculoFitaBordaResponse resp = calculoService.calcularFitaBorda(req);
        return Response.ok(resp).build();
    }
}
