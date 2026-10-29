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
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Integer productId;

    @Column( nullable = false)
    private String productName;

    @Column( nullable = false)
    private String productSKU;

    @Column(name = "price_default",precision = 15, scale = 2)
    private BigDecimal priceDefault;

    @Column(name = "discount",precision = 15, scale = 2)
    private BigDecimal discount;

    @Column(name = "description")
    private String description;

    @Column(nullable = false)
    private String imageUrlDisplay;
    @Column(nullable = false)
    private Double averageRatings;
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "product", orphanRemoval = true)
    private List<Order_Item> orderItems;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "product", orphanRemoval = true)
    private List<Cart> carts;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "product", orphanRemoval = true)
    private List<ProductVariant> productVariants;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, mappedBy = "product", orphanRemoval = true)
    private List<ProductImages> productImages;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "product", orphanRemoval = true)
    private List<Review> reviews;



}
