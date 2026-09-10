package com.moveis.resource;

import com.moveis.dto.ClienteDTO;
import com.moveis.dto.VendaDTO;
import com.moveis.entity.Cliente;
import com.moveis.repository.ClienteRepository;
import com.moveis.repository.VendaRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.stream.Collectors;

@Path("/api/clientes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ClienteResource {

    @Inject ClienteRepository clienteRepository;
    @Inject VendaRepository vendaRepository;

    @GET
    public List<ClienteDTO> listar(@QueryParam("busca") String busca) {
        List<Cliente> clientes = (busca != null && !busca.isBlank())
                ? clienteRepository.buscarPorNome(busca)
                : clienteRepository.listAll();
        return clientes.stream().map(ClienteDTO::from).collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    public Response buscar(@PathParam("id") Long id) {
        Cliente c = clienteRepository.findById(id);
        if (c == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(ClienteDTO.from(c)).build();
    }

    @POST
    @Transactional
    public Response criar(@Valid ClienteDTO dto) {
        if (dto.cpfCnpj != null && !dto.cpfCnpj.isBlank() && clienteRepository.findByCpfCnpj(dto.cpfCnpj).isPresent()) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"erro\":\"Já existe um cliente com este CPF/CNPJ.\"}").build();
        }
        Cliente c = dto.toEntity();
        clienteRepository.persist(c);
        return Response.status(Response.Status.CREATED).entity(ClienteDTO.from(c)).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response atualizar(@PathParam("id") Long id, @Valid ClienteDTO dto) {
        Cliente c = clienteRepository.findById(id);
        if (c == null) return Response.status(Response.Status.NOT_FOUND).build();
        dto.applyTo(c);
        return Response.ok(ClienteDTO.from(c)).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response remover(@PathParam("id") Long id) {
        boolean removido = clienteRepository.deleteById(id);
        if (!removido) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.noContent().build();
    }

    // ---------- Histórico de compras (vendas) do cliente ----------

    @GET
    @Path("/{id}/compras")
    public Response listarCompras(@PathParam("id") Long id) {
        Cliente c = clienteRepository.findById(id);
        if (c == null) return Response.status(Response.Status.NOT_FOUND).build();
        List<VendaDTO> compras = vendaRepository.findByClienteId(id).stream()
                .map(VendaDTO::from).collect(Collectors.toList());
        return Response.ok(compras).build();
    }
}
