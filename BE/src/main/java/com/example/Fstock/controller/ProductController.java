package com.example.Fstock.controller;

import com.example.Fstock.dto.request.CreateProductRequest;
import com.example.Fstock.dto.response.ApiResponse;
import com.example.Fstock.dto.response.ColorInfo;
import com.example.Fstock.dto.response.ProductDto;
import com.example.Fstock.dto.response.ProductVariantDto;
import com.example.Fstock.service.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    private ProductService productService;

    @GetMapping("/page")
    public ResponseEntity<Page<ProductDto>> getAllProducts(@RequestParam(value = "pageNumber", defaultValue = "1") int pageNumber ,
                                                           @RequestParam(value = "pageSize" , defaultValue = "10") int pageSize ,
                                                           @RequestParam(value = "search" , defaultValue = "") String search ){
        Page<ProductDto> productDtos = productService.getAllProducts(pageNumber , pageSize, search);
        return new ResponseEntity<>(productDtos , HttpStatus.OK);
    }

    @GetMapping("/top-selling")
    public ResponseEntity<ApiResponse> getHotProducts(@RequestParam(value = "size", defaultValue = "8") Integer size){
        Page<ProductDto> productDtos = productService.getTopSellingProducts(size);
        return  ResponseEntity.ok(ApiResponse.<Page<ProductDto>>builder()
                .message("Top selling product list")
                .data(productDtos)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getProductById(@PathVariable("id") int productId){
        ProductDto productDto = productService.getProductById(productId);

        return  ResponseEntity.ok(ApiResponse.<ProductDto>builder()
                .message("Product detail")
                .data(productDto)
                .build());
    }
    @GetMapping("/colors")
    public ResponseEntity<ApiResponse> getColorNames(){
        List<ColorInfo> colors = productService.getAllColor();
        return  ResponseEntity.ok(ApiResponse.<List<ColorInfo>>builder()
                .message("Colors")
                .data(colors)
                .build());
    }
    @GetMapping("/sizes")
    public ResponseEntity<ApiResponse> getSizeNames(){
        List<String> sizeNames = productService.getAllSize();
        return  ResponseEntity.ok(ApiResponse.<List<String>>builder()
                .message("Sizes")
                .data(sizeNames)
                .build());
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse> getProductsByFilter(
            @RequestParam(value = "priceMin", required = false) Integer priceMin,
            @RequestParam(value = "priceMax", required = false) Integer priceMax,
            @RequestParam(value = "color", required = false) String colorName,
            @RequestParam(value = "size", required = false) String sizeName,
            @RequestParam(value = "category", required = false) Integer categoryId,
            @RequestParam(value = "productName", required = false) String productName,
            @RequestParam(value = "sortBy", required = false) String sortBy,

            @RequestParam("pageNumber") Integer pageNumber
    )
    {
        Page<ProductDto> productDtos = productService.getProductByFilter(priceMin, priceMax, sizeName, colorName, categoryId, productName, sortBy, pageNumber);
        return  ResponseEntity.ok(ApiResponse.<Page<ProductDto>>builder()
                .message("Product list filtred")
                .data(productDtos)
                .build());
    }
    @GetMapping("/quantity")
    public ResponseEntity<ApiResponse> getQuantityInStock(
            @RequestParam(value = "productId") Integer productId,
            @RequestParam(value = "colorName", required = false) String colorName,
            @RequestParam(value = "sizeName", required = false) String sizeName

    )
    {
        return ResponseEntity.ok(ApiResponse.<Integer>builder()
                .message("Quantity in stock")
                .data(productService.getQuantityInStock(productId, colorName, sizeName))
                .build());

    }
    @PostMapping(value = "/create-product" , consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> createProduct(@ModelAttribute CreateProductRequest createProductRequest)
            throws IOException {
        productService.createProduct(createProductRequest);
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Product created successfully")
                .build());
    }
    @PutMapping(value = "/update-product/{id}" , consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateProduct(@ModelAttribute CreateProductRequest createProductRequest,
                                                     @PathVariable("id") int productId)
            throws IOException {
        productService.updateProduct(productId,createProductRequest);
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Product updated successfully")
                .build());
    }

    @DeleteMapping("/delete/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteProduct(@PathVariable("productId") int productId){
        productService.deleteProduct(productId);
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Product deleted successfully")
                .build());
    }

    @GetMapping("/product-variants")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getListProductVariant(@RequestParam("productId") int productId,
                                                             @RequestParam(value = "pageNumber", defaultValue = "1") int pageNumber){
        return ResponseEntity.ok(ApiResponse.<Page<ProductVariantDto>>builder()
                .message("get list product variant successfully")
                .data(productService.getProductVariantsByProductId(productId, pageNumber))
                .build());
    }







}
