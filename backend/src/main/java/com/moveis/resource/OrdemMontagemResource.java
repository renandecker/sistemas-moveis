package com.moveis.resource;

import com.moveis.dto.OrdemMontagemDTO;
import com.moveis.dto.OrdemMontagemRequest;
import com.moveis.entity.Movel;
import com.moveis.entity.OrdemMontagem;
import com.moveis.entity.StatusOrdem;
import com.moveis.repository.MovelRepository;
import com.moveis.repository.OrdemMontagemRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.stream.Collectors;

@Path("/api/ordens-montagem")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OrdemMontagemResource {

    @Inject
    OrdemMontagemRepository repository;

    @Inject
    MovelRepository movelRepository;

    @GET
    public List<OrdemMontagemDTO> listar(@QueryParam("status") StatusOrdem status) {
        List<OrdemMontagem> ordens = status != null ? repository.findByStatus(status) : repository.listAll();
        return ordens.stream().map(OrdemMontagemDTO::from).collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    public Response buscar(@PathParam("id") Long id) {
        OrdemMontagem o = repository.findById(id);
        if (o == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(OrdemMontagemDTO.from(o)).build();
    }

    @POST
    @Transactional
    public Response criar(@Valid OrdemMontagemRequest req) {
        Movel movel = movelRepository.findById(req.movelId);
        if (movel == null) return Response.status(Response.Status.NOT_FOUND)
                .entity("{\"erro\":\"Móvel não encontrado.\"}").build();

        OrdemMontagem ordem = new OrdemMontagem();
        ordem.movel = movel;
        ordem.quantidadeMoveis = req.quantidadeMoveis;
        ordem.status = StatusOrdem.RASCUNHO;
        repository.persist(ordem);
        return Response.status(Response.Status.CREATED).entity(OrdemMontagemDTO.from(ordem)).build();
    }

    @PATCH
    @Path("/{id}/status")
    @Transactional
    public Response atualizarStatus(@PathParam("id") Long id, StatusOrdem novoStatus) {
        OrdemMontagem ordem = repository.findById(id);
        if (ordem == null) return Response.status(Response.Status.NOT_FOUND).build();
        ordem.status = novoStatus;
        return Response.ok(OrdemMontagemDTO.from(ordem)).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response remover(@PathParam("id") Long id) {
        boolean removido = repository.deleteById(id);
        if (!removido) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.noContent().build();
    }
}
