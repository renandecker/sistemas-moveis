package com.moveis.resource;

import com.moveis.dto.FornecedorMaterialDTO;
import com.moveis.dto.MaterialDTO;
import com.moveis.entity.Material;
import com.moveis.entity.TipoMaterial;
import com.moveis.repository.FornecedorMaterialRepository;
import com.moveis.repository.MaterialRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.stream.Collectors;

@Path("/api/materiais")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MaterialResource {

    @Inject
    MaterialRepository repository;

    @Inject
    FornecedorMaterialRepository fornecedorMaterialRepository;

    @GET
    public List<MaterialDTO> listar(@QueryParam("tipo") TipoMaterial tipo) {
        List<Material> materiais = tipo != null ? repository.findByTipo(tipo) : repository.listAll();
        return materiais.stream().map(MaterialDTO::from).collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    public Response buscar(@PathParam("id") Long id) {
        Material m = repository.findById(id);
        if (m == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(MaterialDTO.from(m)).build();
    }

    @GET
    @Path("/abaixo-estoque-minimo")
    public List<MaterialDTO> abaixoEstoqueMinimo() {
        return repository.abaixoDoEstoqueMinimo().stream().map(MaterialDTO::from).collect(Collectors.toList());
    }

    @GET
    @Path("/{id}/fornecedores")
    public Response listarFornecedores(@PathParam("id") Long id) {
        Material m = repository.findById(id);
        if (m == null) return Response.status(Response.Status.NOT_FOUND).build();
        List<FornecedorMaterialDTO> cotacoes = fornecedorMaterialRepository.findByMaterialId(id).stream()
                .map(FornecedorMaterialDTO::from).collect(Collectors.toList());
        return Response.ok(cotacoes).build();
    }

    @POST
    @Transactional
    public Response criar(@Valid MaterialDTO dto) {
        if (repository.findBySku(dto.sku).isPresent()) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"erro\":\"Já existe um material com este SKU.\"}").build();
        }
        Material m = dto.toEntity();
        repository.persist(m);
        return Response.status(Response.Status.CREATED).entity(MaterialDTO.from(m)).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response atualizar(@PathParam("id") Long id, @Valid MaterialDTO dto) {
        Material m = repository.findById(id);
        if (m == null) return Response.status(Response.Status.NOT_FOUND).build();
        dto.applyTo(m);
        return Response.ok(MaterialDTO.from(m)).build();
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
