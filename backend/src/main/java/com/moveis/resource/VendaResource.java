package com.moveis.resource;

import com.moveis.dto.VendaDTO;
import com.moveis.dto.VendaRequest;
import com.moveis.entity.*;
import com.moveis.repository.ClienteRepository;
import com.moveis.repository.MovelRepository;
import com.moveis.repository.OrdemMontagemRepository;
import com.moveis.repository.VendaRepository;
import com.moveis.service.FluxoCaixaService;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Path("/api/vendas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class VendaResource {

    @Inject VendaRepository vendaRepository;
    @Inject ClienteRepository clienteRepository;
    @Inject MovelRepository movelRepository;
    @Inject OrdemMontagemRepository ordemMontagemRepository;
    @Inject FluxoCaixaService fluxoCaixaService;

    @GET
    public List<VendaDTO> listar(@QueryParam("status") StatusVenda status) {
        List<Venda> vendas = status != null ? vendaRepository.list("status", status) : vendaRepository.listAll();
        return vendas.stream().map(VendaDTO::from).collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    public Response buscar(@PathParam("id") Long id) {
        Venda v = vendaRepository.findById(id);
        if (v == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(VendaDTO.from(v)).build();
    }

    @POST
    @Transactional
    public Response criar(@Valid VendaRequest req) {
        Cliente cliente = clienteRepository.findById(req.clienteId);
        if (cliente == null) return Response.status(Response.Status.NOT_FOUND)
                .entity("{\"erro\":\"Cliente não encontrado.\"}").build();

        Movel movel = movelRepository.findById(req.movelId);
        if (movel == null) return Response.status(Response.Status.NOT_FOUND)
                .entity("{\"erro\":\"Móvel não encontrado.\"}").build();

        Venda venda = new Venda();
        venda.cliente = cliente;
        venda.movel = movel;
        venda.quantidade = req.quantidade;
        venda.valorUnitario = req.valorUnitario;
        venda.valorTotal = req.valorUnitario.multiply(BigDecimal.valueOf(req.quantidade));
        venda.status = StatusVenda.PENDENTE;

        if (req.ordemMontagemId != null) {
            OrdemMontagem ordem = ordemMontagemRepository.findById(req.ordemMontagemId);
            if (ordem == null) return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"erro\":\"Ordem de montagem não encontrada.\"}").build();
            venda.ordemMontagem = ordem;
        }

        vendaRepository.persist(venda);
        fluxoCaixaService.registrarReceitaDeVenda(venda);
        return Response.status(Response.Status.CREATED).entity(VendaDTO.from(venda)).build();
    }

    @PATCH
    @Path("/{id}/status")
    @Transactional
    public Response atualizarStatus(@PathParam("id") Long id, StatusVenda novoStatus) {
        Venda venda = vendaRepository.findById(id);
        if (venda == null) return Response.status(Response.Status.NOT_FOUND).build();
        venda.status = novoStatus;
        return Response.ok(VendaDTO.from(venda)).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response remover(@PathParam("id") Long id) {
        boolean removido = vendaRepository.deleteById(id);
        if (!removido) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.noContent().build();
    }
}
