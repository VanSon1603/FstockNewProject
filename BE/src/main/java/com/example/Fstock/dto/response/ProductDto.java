package com.example.Fstock.dto.response;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto  {
    private Integer productId;
    private String productName;
    private String productSKU;
    private BigDecimal priceDefault;
    private BigDecimal discount;
    private String description;
    private String imageUrlDisplay;
    private CategoryDto category;
    private Double averageRatings;
    private Integer quantityInStock;
    private Integer quantitySold;
    private List<ProductVariantDto> productVariants;
    private List<ProductImagesDto> productImages;
    private List<ReviewResponse> reviewResponses;
}