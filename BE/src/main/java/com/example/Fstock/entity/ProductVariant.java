package com.example.Fstock.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column( nullable = false)
    private Integer productVariantId;

    @Column( nullable = false)
    private Integer stockQuantity;

    @Column(nullable = false)
    private String sizeName;

    @Column(nullable = false)
    private float length;

    @Column(nullable = false)
    private float width;

    @Column(nullable = false)
    private float height;

    @Column(nullable = false)
    private double weight;

    @Column(nullable = false)
    private String colorName;

    @Column(nullable = false)
    private String colorCode;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "productVariant")
    private List<Cart> carts;

}
