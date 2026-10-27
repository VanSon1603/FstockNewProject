package com.example.Fstock.service.Serviceimpl;

import com.example.Fstock.dto.request.ReviewRequest;
import com.example.Fstock.dto.response.ReviewResponse;
import com.example.Fstock.entity.Product;
import com.example.Fstock.entity.Review;
import com.example.Fstock.entity.User;
import com.example.Fstock.exception.InternalServerErrorException;
import com.example.Fstock.exception.NotFoundException;
import com.example.Fstock.responsitory.OrderRepository;
import com.example.Fstock.responsitory.ProductRepository;
import com.example.Fstock.responsitory.ReviewRepository;
import com.example.Fstock.responsitory.UserRepository;
import com.example.Fstock.service.Service.ProductService;
import com.example.Fstock.service.Service.ReviewService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class ReviewServiceimpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductService productService;
    @Autowired
    private UserRepository userRepository;

    private final OrderRepository orderRepository;

    @Override
    @Transactional
    public ReviewResponse createReview(ReviewRequest reviewRequest) {
        User user = userRepository.findByEmail(reviewRequest.getEmail()).orElseThrow(() -> new NotFoundException("Your account have problem"));

        Product product = productRepository.findByProductId(reviewRequest.getProductId());
        if (product == null){
            throw new NotFoundException("Product not exist in system");
        }
        Boolean userOrdered = checkUserOrderd(user, product);
        if (!userOrdered){
            throw new InternalServerErrorException("You have to order this product before review or your order is over 30 days");
        }

        Review review = new Review();
        review.setContent(reviewRequest.getContent());
        review.setRating(reviewRequest.getRating());
        review.setUser(user);
        review.setProduct(product);
        review.setCreatedAt(new Date());
        try {
            reviewRepository.save(review);
            productService.updateAverageRating(reviewRequest.getProductId());
            return ReviewResponse.builder()
                    .id(review.getId())
                    .content(review.getContent())
                    .rating(review.getRating())
                    .createdAt(review.getCreatedAt())
                    .build();

        } catch (Exception e) {
            throw new InternalServerErrorException("create review failed");
        }
    }

    public Boolean checkUserOrderd(User user, Product product){
        LocalDateTime validDate = LocalDateTime.now().minusDays(30);
        return orderRepository.checkUserOrdered(user.getUserId(), product.getProductId(), validDate);
    }
}
