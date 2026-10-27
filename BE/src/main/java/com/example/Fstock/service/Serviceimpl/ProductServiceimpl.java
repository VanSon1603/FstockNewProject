package com.example.Fstock.service.Serviceimpl;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.Fstock.dto.request.CreateProductRequest;
import com.example.Fstock.dto.response.*;
import com.example.Fstock.entity.*;
import com.example.Fstock.exception.NotFoundException;
import com.example.Fstock.mapper.ProductMapper;
import com.example.Fstock.mapper.ProductVariantMapper;
import com.example.Fstock.mapper.ReviewMapper;
import com.example.Fstock.responsitory.*;
import com.example.Fstock.responsitory.specification.ProductSpecification;
import com.example.Fstock.service.Service.ProductService;
import com.example.Fstock.ultis.CloudinaryUltis;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.List;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ProductServiceimpl implements ProductService {
    @Autowired
    private ProductMapper productMapper;
    @Autowired
    private ReviewMapper reviewMapper;
    @Autowired
    private ProductVariantMapper productVariantMapper;
    @Autowired
    private ProductVariantRepository productVariantRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CloudinaryUltis cloudinaryUltis;
    @Autowired
    private  Cloudinary cloudinary;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;

    @Override
    public ProductDto getProductById(int id) {
        Product product = productRepository.findByProductId(id);
        if (product == null) {
            throw new NotFoundException("Product not found");
        }
        ProductDto productDto = productMapper.toDto(product);
        List<ReviewResponse> reviewResponses = new ArrayList<>();
        product.getReviews().forEach(review -> {
            reviewResponses.add(reviewMapper.toReviewResponse(review));
        } );
        productDto.setReviewResponses(reviewResponses);
        return productDto;
    }

    @Override
    public Page<ProductDto> getTopSellingProducts(Integer size) {
        List<Product> products = productRepository.findTopSellingProducts();
        List<ProductDto> productDtos = products.stream()
                .map(product -> productMapper.toDto(product))
                .collect(Collectors.toList());
        Pageable pageDetail = PageRequest.of(0, size);
        int start = (int)pageDetail.getOffset();
        int end = (int)(pageDetail.getOffset()+pageDetail.getPageSize()> productDtos.size() ? productDtos.size() : pageDetail.getOffset()+pageDetail.getPageSize());
        List<ProductDto> productDtoFinal = productDtos.subList(start,end);
        return new PageImpl<>(productDtoFinal, pageDetail,productDtos.size());

    }

    @Override
    public Page<ProductDto> getAllProducts(int pageNumber , int pageSize , String search) {
        List<ProductDto> productDtos =  productMapper.toListDto(productRepository.findAll());
        if (search != null && !search.isEmpty()) {
            List<ProductDto> productByKeyword = productMapper.toListDto( productRepository.findBySearchKeyword(search));
            if (productByKeyword.isEmpty()) {
                throw new NotFoundException("Product not found");
            }
            Set<Integer> productIdsByKeyword = productByKeyword.stream()
                    .map(ProductDto::getProductId)
                    .collect(Collectors.toSet());

            productDtos.removeIf(productDto -> !productIdsByKeyword.contains(productDto.getProductId()));
        }
        Pageable pageDetail = PageRequest.of(pageNumber-1, pageSize);
        int start = (int)pageDetail.getOffset();
        int end = (int)(pageDetail.getOffset()+pageDetail.getPageSize()> productDtos.size() ? productDtos.size() : pageDetail.getOffset()+pageDetail.getPageSize());
        List<ProductDto> productDtosFinal = productDtos.subList(start,end);
        return new PageImpl<>(productDtosFinal, pageDetail,productDtos.size());
    }

    @Override
    public Page<ProductDto> getProductByFilter(Integer priceMin,
                                               Integer priceMax,
                                               String sizeName,
                                               String colorName ,
                                               Integer categoryId,
                                               String productName,
                                               String sortBy,
                                               int pageNumber) {
        // Build dynamic sort
        Sort sort = Sort.unsorted();
        if ("RatingDesc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "averageRatings");
        } else if ("RatingAsc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "averageRatings");
        } else if ("PriceDesc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "priceDefault");
        } else if ("PriceAsc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "priceDefault");
        }

        Pageable pageable = PageRequest.of(pageNumber - 1, 10, sort);

        Specification<Product> specification = Specification.where(ProductSpecification.hasCategory(categoryId))
                .and(ProductSpecification.hasColor(colorName))
                .and(ProductSpecification.hasSize(sizeName))
                .and(ProductSpecification.hasPriceRange(priceMin, priceMax))
                .and(ProductSpecification.hasProductName(productName));

        Page<Product> products = productRepository.findAll(specification, pageable);
        Page<ProductDto> productDtos = products.map(product -> productMapper.toDto(product));
        log.info("Filtered products: {}", productDtos.getContent());
        return  productDtos;
    }

    @Override
    public Integer getQuantityInStock(int productId, String colorName, String sizeName) {
        Product product = productRepository.findByProductId(productId);
        if (product == null) {
            throw new NotFoundException("Product not found");
        }
        if ( colorName != null) {
            if(sizeName == null){
                Integer quantity = product.getProductVariants().stream()
                        .filter(pdVaviant -> pdVaviant.getColorName().equals(colorName))
                        .mapToInt(variant -> variant.getStockQuantity())
                        .sum();
                return quantity;
            }else {
                Integer quantity = product.getProductVariants().stream()
                        .filter(pdVaviant -> pdVaviant.getColorName().equals(colorName) && pdVaviant.getSizeName().equals(sizeName))
                        .mapToInt(variant -> variant.getStockQuantity())
                        .sum();
                return quantity;
            }
        }else{
            if(sizeName == null){
                Integer quantity = product.getProductVariants().stream()
                        .mapToInt(variant -> variant.getStockQuantity())
                        .sum();
                return quantity;
            }else {
                Integer quantity = product.getProductVariants().stream()
                        .filter(pdVaviant -> pdVaviant.getSizeName().equals(sizeName))
                        .mapToInt(variant -> variant.getStockQuantity())
                        .sum();
                return quantity;
            }
        }


    }

    @Override
    public List<ColorInfo> getAllColor() {
        return productVariantRepository.findDistinctColorNameAndColorCode();
    }

    @Override
    public List<String> getAllSize() {
        return productVariantRepository.findDistinctSizeName();
    }

    @Override
    @Transactional
    public void createProduct (CreateProductRequest createProductRequest) throws IOException {
        Product product = new Product();
        product.setProductName(createProductRequest.getProductName());
        product.setDescription(createProductRequest.getDescription());
        product.setPriceDefault(createProductRequest.getPriceDefault());
        product.setAverageRatings(0.0);
        if (productRepository.findByProductSKU(createProductRequest.getProductSKU()) != null) {
            throw new BadRequestException("SKU already exists");
        }
        product.setProductSKU(createProductRequest.getProductSKU());
        Category category = categoryRepository.findById(createProductRequest.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));
        product.setCategory(category);
        List<ProductVariant> productVariants = new ArrayList<>();
        createProductRequest.getVariants().forEach(productVariantRequest -> {
            ProductVariant productVariant = productVariantMapper.toEntity(productVariantRequest);
            productVariant.setProduct(product);
            productVariants.add(productVariant);
        });
        product.setProductVariants(productVariants);
        product.setImageUrlDisplay(cloudinaryUltis.getImageUrlAfterUpload(createProductRequest.getImageUrlDisplay()));
        List<ProductImages> productImageList = new ArrayList<>();
        createProductRequest.getImages().forEach(multipartFile -> {
            try {
                ProductImages productImages = new ProductImages();
                String imageUrl = cloudinaryUltis.getImageUrlAfterUpload(multipartFile);
                productImages.setProductImagesUrl(imageUrl);
                productImages.setProduct(product);
                productImageList.add(productImages);

            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
        product.setProductImages(productImageList);
        productRepository.save(product);
    }



    @Override
    @Transactional
    public void deleteProduct(int productId) {
        Product product = productRepository.findByProductId(productId);
        if (product == null) {
            throw new NotFoundException("Product not found");
        }
        String imageUrlDisplay = product.getImageUrlDisplay();
        String publicIdImgDisplay = cloudinaryUltis.getPublicIdImageCloudinary(imageUrlDisplay);
        List<String> urlImagesGallery = product.getProductImages().stream()
                .map(ProductImages::getProductImagesUrl)
                .collect(Collectors.toList());
        List<String> publicIdImagesGallery = urlImagesGallery.stream()
                .map(url -> cloudinaryUltis.getPublicIdImageCloudinary(url))
                .collect(Collectors.toList());
        try{
            Map resultDisplay = cloudinary.uploader().destroy(publicIdImgDisplay, ObjectUtils.emptyMap());
        }catch (IOException e) {
            throw new RuntimeException(e);
        }
        publicIdImagesGallery.forEach(publicId ->{
            try {
                Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
        productRepository.delete(product);
    }

    @Override
    @Transactional
    public void updateProduct(int productId, CreateProductRequest createProductRequest) throws IOException {
        Product product = productRepository.findByProductId(productId);
        if(product == null) {
            throw new NotFoundException("Product not found");
        }
        product.setProductName(createProductRequest.getProductName());
        product.setDescription(createProductRequest.getDescription());
        product.setPriceDefault(createProductRequest.getPriceDefault());
        product.setProductSKU(createProductRequest.getProductSKU());
        Category category = categoryRepository.findById(createProductRequest.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));
        product.setCategory(category);
        List<ProductVariant> productVariants = product.getProductVariants();
        productVariants.clear();
        createProductRequest.getVariants().forEach(productVariantRequest -> {
            ProductVariant productVariant = productVariantMapper.toEntity(productVariantRequest);
            productVariant.setProduct(product);
            productVariants.add(productVariant);
        });
        if (createProductRequest.getImageUrlDisplay() != null) {
            String imageUrlDisplay = product.getImageUrlDisplay();
            String publicIdImgDisplay = cloudinaryUltis.getPublicIdImageCloudinary(imageUrlDisplay);
            try {
                Map resultDisplay = cloudinary.uploader().destroy(publicIdImgDisplay, ObjectUtils.emptyMap());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            product.setImageUrlDisplay((cloudinaryUltis.getImageUrlAfterUpload(createProductRequest.getImageUrlDisplay())));

        }
        if (createProductRequest.getImages() != null) {
            //xóa list hình cũ
            List<ProductImages> productImageList = product.getProductImages();
            productImageList.forEach(productImages -> {
                String imageUrl = productImages.getProductImagesUrl();
                String publicIdImg = cloudinaryUltis.getPublicIdImageCloudinary(imageUrl);
                try {
                    Map resultDisplay = cloudinary.uploader().destroy(publicIdImg, ObjectUtils.emptyMap());
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            });
            //thêm hình mới
            List<ProductImages> newProductImageList = product.getProductImages();
            newProductImageList.clear();
            createProductRequest.getImages().forEach(multipartFile -> {
                try {
                    ProductImages productImages = new ProductImages();
                    String imageUrl = cloudinaryUltis.getImageUrlAfterUpload(multipartFile);
                    productImages.setProductImagesUrl(imageUrl);
                    productImages.setProduct(product);
                    newProductImageList.add(productImages);

                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            });
        }
        productRepository.save(product);
    }

    @Override
    public void updateAverageRating(Integer productId) {
        Product product = productRepository.findByProductId(productId);
        if(product == null) {
            throw new NotFoundException("Product not found");
        }
        double averageRating = product.getReviews().stream()
                .mapToDouble(Review::getRating)
                .average()
                .orElse(0.0);
        DecimalFormat decimalFormat = new DecimalFormat("#.#");
        averageRating = Double.valueOf(decimalFormat.format(averageRating));
        product.setAverageRatings(averageRating);
        productRepository.save(product);
    }

    @Override
    public Page<ProductVariantDto> getProductVariantsByProductId(int productId, int pageNumber) {
        Pageable pageable = PageRequest.of(pageNumber - 1, 10);
        Page<ProductVariant> productVariants = productVariantRepository.findByProductProductId(productId, pageable);
        Page<ProductVariantDto> productVariantDtos = productVariants.map(variant -> productVariantMapper.toDto(variant));
        return productVariantDtos;
    }

}
