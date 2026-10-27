package com.example.Fstock.mapper;

import com.example.Fstock.dto.response.PermissionResponse;
import com.example.Fstock.dto.response.ProductDto;
import com.example.Fstock.dto.response.RolesReponse;
import com.example.Fstock.entity.Product;
import com.example.Fstock.entity.ProductVariant;
import com.example.Fstock.entity.User_Roles;
import com.example.Fstock.mapper.helper.ProductMapperHelper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = ProductMapperHelper.class)
public interface ProductMapper {
    List<ProductDto> toListDto(List<Product> products);
    @Mapping(target = "quantityInStock", source = "productVariants", qualifiedByName = "calculateQuantityInstock")
    @Mapping(target = "quantitySold", source = ".", qualifiedByName = "calculateQuantitySold")
    ProductDto toDto(Product product);

    @Named("calculateQuantityInstock")
    default Integer mapToQuantityInstock(List<ProductVariant> productVariants) {
        Integer quantityInStock =   productVariants.stream()
                                    .map(ProductVariant::getStockQuantity)
                                    .reduce(0, Integer::sum);
        return quantityInStock;

    }


}
