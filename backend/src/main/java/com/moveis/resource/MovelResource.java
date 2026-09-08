package com.moveis.resource;

import com.moveis.dto.EstruturaMovelDTO;
import com.moveis.dto.EstruturaMovelRequest;
import com.moveis.dto.MovelDTO;
import com.moveis.dto.NecessidadeMateriaisResponse;
import com.moveis.entity.EstruturaMovel;
import com.moveis.entity.Material;
import com.moveis.entity.Movel;
import com.moveis.repository.EstruturaMovelRepository;
import com.moveis.repository.MaterialRepository;
import com.moveis.repository.MovelRepository;
import com.moveis.service.CalculoService;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.stream.Collectors;

@Path("/api/moveis")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MovelResource {

    @Inject
    MovelRepository movelRepository;

    @Inject
    MaterialRepository materialRepository;

    @Inject
    EstruturaMovelRepository estruturaMovelRepository;

    @Inject
    CalculoService calculoService;

    @GET
    public List<MovelDTO> listar() {
        return movelRepository.listAll().stream().map(MovelDTO::from).collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    public Response buscar(@PathParam("id") Long id) {
        Movel m = movelRepository.findById(id);
        if (m == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(MovelDTO.fromWithEstrutura(m)).build();
    }

    @POST
    @Transactional
    public Response criar(@Valid MovelDTO dto) {
        if (movelRepository.findByCodigo(dto.codigo).isPresent()) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"erro\":\"Já existe um móvel com este código.\"}").build();
        }
        Movel m = dto.toEntity();
        movelRepository.persist(m);
        return Response.status(Response.Status.CREATED).entity(MovelDTO.from(m)).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response atualizar(@PathParam("id") Long id, @Valid MovelDTO dto) {
        Movel m = movelRepository.findById(id);
        if (m == null) return Response.status(Response.Status.NOT_FOUND).build();
        dto.applyTo(m);
        return Response.ok(MovelDTO.from(m)).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response remover(@PathParam("id") Long id) {
        boolean removido = movelRepository.deleteById(id);
        if (!removido) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.noContent().build();
    }

    // ---------- BOM (estrutura_movel) ----------

    @GET
    @Path("/{id}/estrutura")
    public List<EstruturaMovelDTO> listarEstrutura(@PathParam("id") Long id) {
        return estruturaMovelRepository.findByMovelId(id).stream()
                .map(EstruturaMovelDTO::from).collect(Collectors.toList());
    }

    @POST
    @Path("/{id}/estrutura")
    @Transactional
    public Response adicionarItemEstrutura(@PathParam("id") Long id, @Valid EstruturaMovelRequest req) {
        Movel movel = movelRepository.findById(id);
        if (movel == null) return Response.status(Response.Status.NOT_FOUND)
                .entity("{\"erro\":\"Móvel não encontrado.\"}").build();

        Material material = materialRepository.findById(req.materialId);
        if (material == null) return Response.status(Response.Status.NOT_FOUND)
                .entity("{\"erro\":\"Material não encontrado.\"}").build();

        EstruturaMovel item = new EstruturaMovel();
        item.movel = movel;
        item.material = material;
        item.quantidadeNecessaria = req.quantidadeNecessaria;
        item.percentualPerdaAplicado = req.percentualPerdaAplicado;
        item.comprimentoPecaMm = req.comprimentoPecaMm;
        item.larguraPecaMm = req.larguraPecaMm;
        item.ladosFitados = req.ladosFitados;

        estruturaMovelRepository.persist(item);
        return Response.status(Response.Status.CREATED).entity(EstruturaMovelDTO.from(item)).build();
    }

    @PUT
    @Path("/{id}/estrutura/{itemId}")
    @Transactional
    public Response atualizarItemEstrutura(@PathParam("id") Long id, @PathParam("itemId") Long itemId,
                                            @Valid EstruturaMovelRequest req) {
        EstruturaMovel item = estruturaMovelRepository.findById(itemId);
        if (item == null || !item.movel.id.equals(id)) return Response.status(Response.Status.NOT_FOUND).build();

        Material material = materialRepository.findById(req.materialId);
        if (material == null) return Response.status(Response.Status.NOT_FOUND)
                .entity("{\"erro\":\"Material não encontrado.\"}").build();

        item.material = material;
        item.quantidadeNecessaria = req.quantidadeNecessaria;
        item.percentualPerdaAplicado = req.percentualPerdaAplicado;
        item.comprimentoPecaMm = req.comprimentoPecaMm;
        item.larguraPecaMm = req.larguraPecaMm;
        item.ladosFitados = req.ladosFitados;

        return Response.ok(EstruturaMovelDTO.from(item)).build();
    }

    @DELETE
    @Path("/{id}/estrutura/{itemId}")
    @Transactional
    public Response removerItemEstrutura(@PathParam("id") Long id, @PathParam("itemId") Long itemId) {
        EstruturaMovel item = estruturaMovelRepository.findById(itemId);
        if (item == null || !item.movel.id.equals(id)) return Response.status(Response.Status.NOT_FOUND).build();
        estruturaMovelRepository.delete(item);
        return Response.noContent().build();
    }

    // ---------- Cálculo de necessidade de materiais (explosão de BOM) ----------

    @GET
    @Path("/{id}/necessidade-materiais")
    public Response calcularNecessidade(@PathParam("id") Long id,
                                         @QueryParam("quantidade") @DefaultValue("1") int quantidade) {
        Movel movel = movelRepository.findById(id);
        if (movel == null) return Response.status(Response.Status.NOT_FOUND).build();
        if (quantidade < 1) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"erro\":\"Quantidade deve ser maior ou igual a 1.\"}").build();
        }
        NecessidadeMateriaisResponse resp = calculoService.calcularNecessidadeMateriais(movel, quantidade);
        return Response.ok(resp).build();
    }
}
