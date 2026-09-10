package com.moveis.resource;

import com.moveis.dto.MovimentacaoEstoqueDTO;
import com.moveis.dto.MovimentacaoEstoqueRequest;
import com.moveis.entity.MovimentacaoEstoque;
import com.moveis.entity.TipoMovimentacao;
import com.moveis.repository.MovimentacaoEstoqueRepository;
import com.moveis.service.EstoqueService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.stream.Collectors;

@Path("/api/movimentacoes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MovimentacaoEstoqueResource {

    @Inject MovimentacaoEstoqueRepository repository;
    @Inject EstoqueService estoqueService;

    @GET
    public List<MovimentacaoEstoqueDTO> listar(@QueryParam("materialId") Long materialId,
                                                @QueryParam("tipo") TipoMovimentacao tipo) {
        List<MovimentacaoEstoque> movimentacoes;
        if (materialId != null) {
            movimentacoes = repository.findByMaterialId(materialId);
        } else if (tipo != null) {
            movimentacoes = repository.findByTipo(tipo);
        } else {
            movimentacoes = repository.listarTodasOrdenadas();
        }
        return movimentacoes.stream().map(MovimentacaoEstoqueDTO::from).collect(Collectors.toList());
    }

    @POST
    public Response registrar(@Valid MovimentacaoEstoqueRequest req) {
        MovimentacaoEstoque mov = estoqueService.registrarMovimentacao(req);
        return Response.status(Response.Status.CREATED).entity(MovimentacaoEstoqueDTO.from(mov)).build();
    }
}
