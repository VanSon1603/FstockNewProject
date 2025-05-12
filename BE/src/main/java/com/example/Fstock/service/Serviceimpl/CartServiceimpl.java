package com.example.Fstock.service.Serviceimpl;

import com.example.Fstock.dto.request.AddToCartRequest;
import com.example.Fstock.dto.request.UpdateCartRequest;
import com.example.Fstock.dto.response.CartDetailResponse;
import com.example.Fstock.entity.Cart;
import com.example.Fstock.entity.Product;
import com.example.Fstock.entity.ProductVariant;
import com.example.Fstock.entity.User;
import com.example.Fstock.exception.BadRequestException;
import com.example.Fstock.exception.NotFoundException;
import com.example.Fstock.mapper.ProductMapper;
import com.example.Fstock.responsitory.CartRepository;
import com.example.Fstock.responsitory.ProductRepository;
import com.example.Fstock.responsitory.ProductVariantRepository;
import com.example.Fstock.responsitory.UserRepository;
import com.example.Fstock.service.Service.CartService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@Slf4j
public class CartServiceimpl implements CartService {
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductMapper productMapper;
    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Override
    public void addToCart(AddToCartRequest addToCartRequest){
        Product product = productRepository.findByProductId(addToCartRequest.getProductId());
        User user = userRepository.findByEmail(addToCartRequest.getEmail()).orElseThrow(() -> new NotFoundException("Your account have problem"));

        if (product == null){
            throw new NotFoundException("Product not exist in system");
        }

        if (addToCartRequest.getQuantity() <= 0){
            throw new BadRequestException("Quantity must be greater than 0");
        }
        if ( addToCartRequest.getColorName() == null || addToCartRequest.getSizeName() == null){
            throw new BadRequestException("Color or size must not be null");
        }
        ProductVariant productVariant = productVariantRepository.findByProductProductIdAndColorNameAndSizeName(addToCartRequest.getProductId() ,addToCartRequest.getColorName(), addToCartRequest.getSizeName());
        Cart cart = new Cart();
        cart.setProduct(product);
        cart.setUser(user);
        cart.setQuantity(addToCartRequest.getQuantity());
        cart.setCurrentPrice(addToCartRequest.getCurrentPrice());
        if(productVariant.getStockQuantity() > addToCartRequest.getQuantity()){
            cart.setProductVariant(productVariant);
        }else {
            throw new BadRequestException("Not enough stock");
        }
        cartRepository.save(cart);

    }

    @Override
    public List<CartDetailResponse> getCartDetails(String email) {
        List<Cart> carts = cartRepository.findByUserEmail(email);
        if (carts.isEmpty()) {
            throw new NotFoundException("No items in cart");
        }
        List<CartDetailResponse> cartDetailResponses = new ArrayList<>();
        carts.forEach(cart -> {
            Product product = cart.getProduct();
            int quantity = cart.getQuantity();
            CartDetailResponse cartDetailResponse = CartDetailResponse.builder()
                    .email(email)
                    .cartId(cart.getCartId())
                    .product(productMapper.toDto(product))
                    .quantity(quantity)
                    .currentPrice(cart.getCurrentPrice())
                    .colorName(cart.getProductVariant().getColorName())
                    .sizeName(cart.getProductVariant().getSizeName())
                    .build();
            cartDetailResponses.add(cartDetailResponse);
        });
        return cartDetailResponses;


    }

    @Override
    @Transactional
    public void updateCart(List<UpdateCartRequest> updateCartRequests) {

        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        List<Cart> carts = cartRepository.findByUserEmail(email);
        List<Integer> cartIds =new ArrayList<>();
        updateCartRequests.forEach(updateCartRequest -> cartIds.add(updateCartRequest.getCartId()));
        carts.forEach(cart -> {
            if (!cartIds.contains(Integer.valueOf(cart.getCartId()))) {
                cartRepository.deleteByCartId(cart.getCartId());
            }
        });
       updateCartRequests.forEach((updateCartRequest) -> {
           Cart cart = cartRepository.findById(updateCartRequest.getCartId())
                   .orElseThrow(() -> new NotFoundException("Cart not found"));
           Product product = productRepository.findByProductId(updateCartRequest.getProductId());
           User user = userRepository.findByEmail(updateCartRequest.getEmail()).orElseThrow(() -> new NotFoundException("Your account have problem"));
           if (product == null) {
               throw new NotFoundException("Product not found");
           }

           if (updateCartRequest.getQuantity() <= 0) {
                throw new BadRequestException("Quantity must be greater than 0");
           }
           cart.setProduct(product);
           cart.setUser(user);
           cart.setQuantity(updateCartRequest.getQuantity());
           cartRepository.save(cart);
       });

    }


}
