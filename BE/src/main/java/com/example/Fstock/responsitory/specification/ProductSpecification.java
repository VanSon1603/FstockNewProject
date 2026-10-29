package com.example.Fstock.responsitory.specification;
import com.example.Fstock.entity.Product;
import com.example.Fstock.entity.ProductVariant;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecification {
    public static Specification<Product> hasProductName(String productName) {
        return (root, query, cb) -> {
            if (productName == null) return null;
            return cb.like(cb.lower(root.get("productName")), "%" + productName.toLowerCase() + "%");
        };
    }
    public static Specification<Product> hasCategory(Integer categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) return null;
            return cb.equal(root.get("category").get("categoryId"), categoryId);
        };
    }
    public static Specification<Product> hasColor(String colorName) {
        return (root, query, cb) -> {
            if (colorName == null) return null;
            Join<Product, ProductVariant> productJoin = root.join("productVariants");
            return cb.equal(productJoin.get("colorName"), colorName);
        };
    }
    public static Specification<Product> hasSize(String sizeName) {
        return (root, query, cb) -> {
            if (sizeName == null) return null;
            Join<Product, ProductVariant> productJoin = root.join("productVariants");
            return cb.equal(productJoin.get("sizeName"), sizeName);
        };
    }
    public static Specification<Product> hasPriceRange(Integer priceMin, Integer priceMax) {
        return (root, query, cb) -> {
            if (priceMin == null && priceMax == null) return null;
            if (priceMin != null && priceMax != null) {
                return cb.between(root.get("priceDefault"), priceMin, priceMax);
            } else if (priceMin != null) {
                return cb.greaterThanOrEqualTo(root.get("priceDefault"), priceMin);
            } else {
                return cb.lessThanOrEqualTo(root.get("priceDefault"), priceMax);
            }
        };
    }

}
