package com.example.Fstock.responsitory;

import com.example.Fstock.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Objects;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer>, JpaSpecificationExecutor<Product> {

    @Query("select p from Product p where p.productSKU like %:keyword% or p.productName like %:keyword%")
    List <Product> findBySearchKeyword (@Param("keyword") String searchKeyword);

    Product findByProductId  (Integer id);

    Product findByProductSKU (String productSKU);

    @Query("SELECT p, SUM(oi.quantity) as totalQuantity " +
            "FROM Product p " +
            "JOIN Order_Item oi ON p.productId = oi.product.productId " +
            "JOIN Order o ON oi.order.orderId = o.orderId " +
            "WHERE o.orderStatus = 'COMPLETED' " +
            "GROUP BY p " +
            "ORDER BY totalQuantity DESC")
    List<Product> findTopSellingProducts ();

    @Query("SELECT SUM(oi.quantity) " +
            "FROM Product p " +
            "JOIN Order_Item oi ON p.productId = oi.product.productId " +
            "JOIN Order o ON oi.order.orderId = o.orderId " +
            "WHERE o.orderStatus = 'COMPLETED' AND p.productId = :productId")
    Integer getTotalQuantitySoldByProductId(@Param("productId") Integer productId);


}
