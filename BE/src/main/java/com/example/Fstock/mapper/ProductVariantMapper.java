package com.example.Fstock.mapper;

import com.example.Fstock.dto.request.ProductVariantRequest;
import com.example.Fstock.dto.response.ProductVariantDto;
import com.example.Fstock.entity.ProductVariant;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductVariantMapper {
    ProductVariant toEntity(ProductVariantRequest productVariantRequest);
    List<ProductVariant> toEntitys(List<ProductVariantRequest> productVariantRequests);
    ProductVariantDto toDto(ProductVariant productVariant);

}
