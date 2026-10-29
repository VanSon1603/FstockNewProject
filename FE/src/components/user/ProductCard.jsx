import { useNavigate } from "react-router-dom";
import PropType from "prop-types";
const ProductCard = ({ product }) => {
  const navigator = useNavigate();

  const handleProductDetail = (id, event) => {
    event.preventDefault();
    navigator(`/product-detail/${id}`);
  };

  return (
    <div className="product__wrapper mb-60">
      <div className="product__thumb">
        <a
          onClick={() => {
            handleProductDetail(product.productId, event);
          }}
          className="w-img"
        >
          {Array.isArray(product.productImages) && (
            <img 
            src={product.imageUrlDisplay} alt="Product Image" />
          )}{" "}
        </a>
        <div className="product__action transition-3">
          <a
            href="#"
            data-bs-toggle="tooltip"
            data-placement="top"
            title="Add to Wishlist"
          >
            <i className="fal fa-heart"></i>
          </a>
          <a
            href="#"
            data-bs-toggle="tooltip"
            data-placement="top"
            title="Compare"
          >
            <i className="fal fa-sliders-h"></i>
          </a>
          <a
            href="#"
            data-bs-toggle="modal"
            data-bs-target="#productModalId"
            onClick={() => handleProductDetail(product.productId, event)}
          >
            <i className="fal fa-search"></i>
          </a>
        </div>
        {product?.discount && product.discount > 0 && (
          <div className="product__sale">
            <span className="new">new</span>
            <span className="percent">-{product.discount}%</span>
          </div>
        )}
      </div>
      <div className="product__content p-relative">
        <div className="product__content-inner">
              <h4>
                <a href="product-details.html">{product.productName}</a>
              </h4>
              <div className="product__price transition-3">
                <span>{product.priceDefault}</span>
                <span className="old-price">$96</span>
              </div>

        </div>
        <div className="add-cart p-absolute transition-3">
          <a href="#"             
          onClick={() => handleProductDetail(product.productId, event)}
          >+ Add to Cart</a>
        </div>
      </div>
    </div>
  );
};
ProductCard.propTypes = {
  product: PropType.object.isRequired,
};
export default ProductCard;
