package com.moveis.exception;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

/**
 * Garante que exceções JAX-RS padrão (NotFoundException, BadRequestException...)
 * lançadas a partir dos services também voltem no mesmo formato JSON
 * `{"erro": "mensagem"}` usado manualmente pelos demais endpoints da API.
 */
@Provider
public class WebApplicationExceptionMapper implements ExceptionMapper<WebApplicationException> {

    @Override
    public Response toResponse(WebApplicationException exception) {
        int status = exception.getResponse().getStatus();
        String mensagem = exception.getMessage() != null ? exception.getMessage() : "Erro ao processar a requisição.";
        return Response.status(status)
                .entity("{\"erro\":\"" + mensagem.replace("\"", "'") + "\"}")
                .type(MediaType.APPLICATION_JSON)
                .build();
    }
}
