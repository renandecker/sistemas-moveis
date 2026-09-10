package com.moveis.resource;

import com.moveis.dto.FornecedorDTO;
import com.moveis.dto.FornecedorMaterialDTO;
import com.moveis.dto.FornecedorMaterialRequest;
import com.moveis.entity.Fornecedor;
import com.moveis.entity.FornecedorMaterial;
import com.moveis.entity.Material;
import com.moveis.repository.FornecedorMaterialRepository;
import com.moveis.repository.FornecedorRepository;
import com.moveis.repository.MaterialRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.stream.Collectors;

@Path("/api/fornecedores")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FornecedorResource {

    @Inject FornecedorRepository fornecedorRepository;
    @Inject FornecedorMaterialRepository fornecedorMaterialRepository;
    @Inject MaterialRepository materialRepository;

    @GET
    public List<FornecedorDTO> listar(@QueryParam("apenasAtivos") boolean apenasAtivos) {
        List<Fornecedor> fornecedores = apenasAtivos
                ? fornecedorRepository.list("ativo", true)
                : fornecedorRepository.listAll();
        return fornecedores.stream().map(FornecedorDTO::from).collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    public Response buscar(@PathParam("id") Long id) {
        Fornecedor f = fornecedorRepository.findById(id);
        if (f == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(FornecedorDTO.from(f)).build();
    }

    @POST
    @Transactional
    public Response criar(@Valid FornecedorDTO dto) {
        if (dto.cnpj != null && !dto.cnpj.isBlank() && fornecedorRepository.findByCnpj(dto.cnpj).isPresent()) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"erro\":\"Já existe um fornecedor com este CNPJ.\"}").build();
        }
        Fornecedor f = dto.toEntity();
        fornecedorRepository.persist(f);
        return Response.status(Response.Status.CREATED).entity(FornecedorDTO.from(f)).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response atualizar(@PathParam("id") Long id, @Valid FornecedorDTO dto) {
        Fornecedor f = fornecedorRepository.findById(id);
        if (f == null) return Response.status(Response.Status.NOT_FOUND).build();
        dto.applyTo(f);
        return Response.ok(FornecedorDTO.from(f)).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response remover(@PathParam("id") Long id) {
        boolean removido = fornecedorRepository.deleteById(id);
        if (!removido) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.noContent().build();
    }

    // ---------- Tabela de preços (materiais fornecidos) ----------

    @GET
    @Path("/{id}/materiais")
    public Response listarMateriaisFornecidos(@PathParam("id") Long id) {
        Fornecedor f = fornecedorRepository.findById(id);
        if (f == null) return Response.status(Response.Status.NOT_FOUND).build();
        List<FornecedorMaterialDTO> itens = fornecedorMaterialRepository.findByFornecedorId(id).stream()
                .map(FornecedorMaterialDTO::from).collect(Collectors.toList());
        return Response.ok(itens).build();
    }

    @POST
    @Path("/{id}/materiais")
    @Transactional
    public Response adicionarMaterialFornecido(@PathParam("id") Long id, @Valid FornecedorMaterialRequest req) {
        Fornecedor fornecedor = fornecedorRepository.findById(id);
        if (fornecedor == null) return Response.status(Response.Status.NOT_FOUND)
                .entity("{\"erro\":\"Fornecedor não encontrado.\"}").build();

        Material material = materialRepository.findById(req.materialId);
        if (material == null) return Response.status(Response.Status.NOT_FOUND)
                .entity("{\"erro\":\"Material não encontrado.\"}").build();

        if (fornecedorMaterialRepository.findByFornecedorEMaterial(id, req.materialId).isPresent()) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"erro\":\"Este fornecedor já possui um preço cadastrado para este material. Edite o item existente.\"}").build();
        }

        FornecedorMaterial fm = new FornecedorMaterial();
        fm.fornecedor = fornecedor;
        fm.material = material;
        fm.precoUnitario = req.precoUnitario;
        fm.prazoEntregaDias = req.prazoEntregaDias;
        fm.preferencial = req.preferencial != null && req.preferencial;

        fornecedorMaterialRepository.persist(fm);
        return Response.status(Response.Status.CREATED).entity(FornecedorMaterialDTO.from(fm)).build();
    }

    @PUT
    @Path("/{id}/materiais/{itemId}")
    @Transactional
    public Response atualizarMaterialFornecido(@PathParam("id") Long id, @PathParam("itemId") Long itemId,
                                                @Valid FornecedorMaterialRequest req) {
        FornecedorMaterial fm = fornecedorMaterialRepository.findById(itemId);
        if (fm == null || !fm.fornecedor.id.equals(id)) return Response.status(Response.Status.NOT_FOUND).build();

        fm.precoUnitario = req.precoUnitario;
        fm.prazoEntregaDias = req.prazoEntregaDias;
        fm.preferencial = req.preferencial != null && req.preferencial;

        return Response.ok(FornecedorMaterialDTO.from(fm)).build();
    }

    @DELETE
    @Path("/{id}/materiais/{itemId}")
    @Transactional
    public Response removerMaterialFornecido(@PathParam("id") Long id, @PathParam("itemId") Long itemId) {
        FornecedorMaterial fm = fornecedorMaterialRepository.findById(itemId);
        if (fm == null || !fm.fornecedor.id.equals(id)) return Response.status(Response.Status.NOT_FOUND).build();
        fornecedorMaterialRepository.delete(fm);
        return Response.noContent().build();
    }
}
