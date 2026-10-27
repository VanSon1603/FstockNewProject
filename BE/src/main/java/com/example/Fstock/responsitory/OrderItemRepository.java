package com.example.Fstock.responsitory;

import com.example.Fstock.entity.Order_Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<Order_Item, Integer>, JpaSpecificationExecutor<Order_Item> {


}
