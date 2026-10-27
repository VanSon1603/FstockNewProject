package com.example.Fstock.mapper.helper;
import com.example.Fstock.entity.Product;
import com.example.Fstock.responsitory.ProductRepository;
import org.mapstruct.Named;
import org.springframework.stereotype.Component;

@Component
public class ProductMapperHelper {
    private final ProductRepository productRepository;

    public ProductMapperHelper(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Named("calculateQuantitySold")
    public Integer calculateQuantitySold(Product product) {
        Integer result = productRepository.getTotalQuantitySoldByProductId(product.getProductId());
        return result == null ? 0 : result;
    }
}
