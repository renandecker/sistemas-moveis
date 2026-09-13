package com.moveis.service;

import com.moveis.dto.*;
import com.moveis.entity.EstruturaMovel;
import com.moveis.entity.Material;
import com.moveis.entity.Movel;
import com.moveis.repository.FornecedorMaterialRepository;
import com.moveis.repository.MaterialRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Implementa as fórmulas de cálculo de insumos descritas na Seção 2 da
 * especificação técnica.
 */
@ApplicationScoped
public class CalculoService {

    private static final BigDecimal MM2_PARA_M2 = new BigDecimal("1000000"); // 1 m² = 1.000.000 mm²
    private static final BigDecimal MM_PARA_M = new BigDecimal("1000");

    @ConfigProperty(name = "app.fita-borda.fator-seguranca", defaultValue = "1.10")
    BigDecimal fatorSegurancaFitaBorda;

    @Inject MaterialRepository materialRepository;
    @Inject FornecedorMaterialRepository fornecedorMaterialRepository;

    /**
     * 2.1 Cálculo de Chapas (Plano de Corte)
     * Área Total de Peças (m²) = Σ (Comprimento × Largura × Quantidade)
     * Chapas Necessárias = ⌈ Área Total / (Área Útil da Chapa × (1 - Perda Corte)) ⌉
     */
    public CalculoChapaResponse calcularChapas(CalculoChapaRequest req) {
        BigDecimal areaTotalMm2 = BigDecimal.ZERO;
        for (PecaCorteDTO peca : req.pecas) {
            BigDecimal areaPeca = BigDecimal.valueOf(peca.comprimentoMm)
                    .multiply(BigDecimal.valueOf(peca.larguraMm))
                    .multiply(BigDecimal.valueOf(peca.quantidade));
            areaTotalMm2 = areaTotalMm2.add(areaPeca);
        }
        BigDecimal areaTotalM2 = areaTotalMm2.divide(MM2_PARA_M2, 6, RoundingMode.HALF_UP);

        // Resolve a área útil da chapa e o custo unitário: a partir do material
        // selecionado (e opcionalmente do fornecedor), ou do valor informado manualmente.
        BigDecimal areaUtilChapaM2 = req.areaUtilChapaM2;
        String materialNome = null;
        String fornecedorNome = null;
        BigDecimal custoUnitarioChapa = null;

        if (req.materialId != null) {
            Material material = materialRepository.findById(req.materialId);
            if (material == null) throw new NotFoundException("Material não encontrado.");
            if (material.comprimentoMm == null || material.larguraMm == null) {
                throw new BadRequestException(
                        "O material \"" + material.nome + "\" não tem comprimento/largura de chapa cadastrados.");
            }

            areaUtilChapaM2 = BigDecimal.valueOf(material.comprimentoMm)
                    .multiply(BigDecimal.valueOf(material.larguraMm))
                    .divide(MM2_PARA_M2, 6, RoundingMode.HALF_UP);
            materialNome = material.nome;
            custoUnitarioChapa = material.custoUnitario;

            if (req.fornecedorId != null) {
                var cotacao = fornecedorMaterialRepository.findByFornecedorEMaterial(req.fornecedorId, req.materialId);
                if (cotacao.isPresent()) {
                    custoUnitarioChapa = cotacao.get().precoUnitario;
                    fornecedorNome = cotacao.get().fornecedor.nome;
                }
                // se não houver cotação cadastrada para esse par, mantém o custo padrão do material
            }
        }

        if (areaUtilChapaM2 == null) {
            throw new BadRequestException("Informe a área útil da chapa manualmente ou selecione um material.");
        }

        BigDecimal umMenosPerda = BigDecimal.ONE.subtract(req.percentualPerdaCorte);
        BigDecimal areaUtilLiquida = areaUtilChapaM2.multiply(umMenosPerda);

        if (areaUtilLiquida.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException(
                    "Área útil líquida da chapa deve ser positiva. Verifique o percentual de perda de corte.");
        }

        BigDecimal chapasExatas = areaTotalM2.divide(areaUtilLiquida, 10, RoundingMode.HALF_UP);
        int chapasNecessarias = chapasExatas.setScale(0, RoundingMode.CEILING).intValue();

        CalculoChapaResponse resp = new CalculoChapaResponse(
                areaTotalM2.setScale(4, RoundingMode.HALF_UP),
                areaUtilLiquida.setScale(4, RoundingMode.HALF_UP),
                chapasNecessarias);

        resp.materialNome = materialNome;
        resp.fornecedorNome = fornecedorNome;
        resp.custoUnitarioChapa = custoUnitarioChapa != null ? custoUnitarioChapa.setScale(2, RoundingMode.HALF_UP) : null;
        resp.custoTotalEstimado = custoUnitarioChapa != null
                ? custoUnitarioChapa.multiply(BigDecimal.valueOf(chapasNecessarias)).setScale(2, RoundingMode.HALF_UP)
                : null;

        return resp;
    }

    /**
     * 2.2 Cálculo de Fita de Borda
     * Perímetro Fitado (m) = Σ [(Lados Fitados) × Comprimento do Lado] × 1.10
     */
    public CalculoFitaBordaResponse calcularFitaBorda(CalculoFitaBordaRequest req) {
        BigDecimal perimetroBrutoMm = BigDecimal.ZERO;
        for (LadoFitadoDTO item : req.itens) {
            BigDecimal contribuicao = BigDecimal.valueOf(item.quantidadeLados)
                    .multiply(BigDecimal.valueOf(item.comprimentoLadoMm));
            perimetroBrutoMm = perimetroBrutoMm.add(contribuicao);
        }
        BigDecimal perimetroBrutoM = perimetroBrutoMm.divide(MM_PARA_M, 6, RoundingMode.HALF_UP);
        BigDecimal perimetroFitadoM = perimetroBrutoM.multiply(fatorSegurancaFitaBorda);

        return new CalculoFitaBordaResponse(
                perimetroBrutoM.setScale(4, RoundingMode.HALF_UP),
                perimetroFitadoM.setScale(4, RoundingMode.HALF_UP));
    }

    /**
     * Explode a BOM (estrutura_movel) de um Móvel para a quantidade solicitada,
     * aplicando o fator de perda de cada item (percentual_perda_aplicado ou,
     * na ausência dele, o fator_perda_padrao cadastrado no material).
     */
    public NecessidadeMateriaisResponse calcularNecessidadeMateriais(Movel movel, int quantidadeMoveis) {
        NecessidadeMateriaisResponse resp = new NecessidadeMateriaisResponse();
        resp.movelId = movel.id;
        resp.movelNome = movel.nome;
        resp.quantidadeMoveis = quantidadeMoveis;
        resp.itens = new ArrayList<>();

        BigDecimal custoTotal = BigDecimal.ZERO;

        for (EstruturaMovel item : movel.estrutura) {
            NecessidadeMaterialDTO dto = new NecessidadeMaterialDTO();
            dto.materialId = item.material.id;
            dto.sku = item.material.sku;
            dto.nome = item.material.nome;
            dto.tipo = item.material.tipo;
            dto.unidadeMedida = item.material.unidadeMedida;
            dto.custoUnitario = item.material.custoUnitario;

            BigDecimal quantidadeBase = item.quantidadeNecessaria.multiply(BigDecimal.valueOf(quantidadeMoveis));
            dto.quantidadeBaseTotal = quantidadeBase.setScale(4, RoundingMode.HALF_UP);

            BigDecimal percentualPerda = item.percentualPerdaAplicado != null
                    ? item.percentualPerdaAplicado
                    : item.material.fatorPerdaPadrao;
            dto.percentualPerdaAplicado = percentualPerda;

            BigDecimal comPerda = quantidadeBase.multiply(BigDecimal.ONE.add(percentualPerda));
            dto.quantidadeComPerda = comPerda.setScale(4, RoundingMode.HALF_UP);

            dto.custoTotalEstimado = dto.quantidadeComPerda
                    .multiply(item.material.custoUnitario, new MathContext(10))
                    .setScale(2, RoundingMode.HALF_UP);

            custoTotal = custoTotal.add(dto.custoTotalEstimado);
            resp.itens.add(dto);
        }

        resp.custoTotalEstimado = custoTotal.setScale(2, RoundingMode.HALF_UP);
        resp.tempoTotalEstimadoMin = movel.tempoEstimadoMontagemMin != null
                ? movel.tempoEstimadoMontagemMin * quantidadeMoveis
                : null;

        return resp;
    }
}
