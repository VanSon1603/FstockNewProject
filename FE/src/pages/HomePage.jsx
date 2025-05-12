import { useContext, useEffect, useState } from "react";
import sliderImage from "/img/slider/slider-1.jpg";
import { getAllProducts } from "../service/ProductService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ToastContext } from "../contexts/ToastContext";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const {toast} = useContext(ToastContext);
  const [params] = useSearchParams();

  useEffect(() => {
    if (params?.has("verify-email") ) {
      toast.success("Xác thực email thành công");
    }
    return ;
  }, [params]);

  useEffect(() => {
    getAllProducts()
      .then((result) => {
        setProducts(result.data.content);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const navigator = useNavigate();

  const handleProductDetail = (id, event) => {
    event.preventDefault();
    navigator(`/product-detail/${id}`);
  };

  return (
    <>
      <section className="slider__area slider__area-3 p-relative">
        <div className="slider-active">
          <div
            className="single-slider single-slider-2 slider__height-5 d-flex align-items-center"
            style={{ backgroundImage: `url(${sliderImage})` }}
          >
            <div className="container-fluid">
              <div className="row">
                <div className="col-xl-6 col-lg-7 col-md-10">
                  <div className="slider__content slider__content-3 pl-250">
                    <h2 data-animation="fadeInUp" data-delay=".2s">
                      Handmade
                    </h2>
                    <p data-animation="fadeInUp" data-delay=".4s">
                      As rich and unique as the coffee beans it is intended for,
                      this little scoop will make your morning ritual a special
                      occasion every day.{" "}
                    </p>
                    <a
                      href="shop.html"
                      className="os-btn os-btn-2"
                      data-animation="fadeInUp"
                      data-delay=".6s"
                    >
                      Discover now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="box-25">
        <section className="product__area pt-60 pb-100">
          <div className="container-fluid">
            <div className="row">
              <div className="col-xl-12">
                <div className="section__title-wrapper text-center mb-55">
                  <div className="section__title mb-10">
                    <h2>Trending Products</h2>
                  </div>
                  <div className="section__sub-title">
                    <p>
                      Mirum est notare quam littera gothica quam nunc putamus
                      parum claram!
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              {products.map((item) => {
                return (
                  <div
                    className="col-xl-3 col-lg-3 col-md-6"
                    key={item.productId}
                  >
                    <div className="product__item">
                      <div className="product__wrapper mb-60">
                        <div className="product__thumb">
                          <a
                            href=""
                            className="w-img"
                            onClick={() =>
                              handleProductDetail(item.productId, event)
                            }
                          >
                            <img
                              src={item.imageUrlDisplay}
                              alt="Product Image"
                            />
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
                              href=""
                              data-bs-toggle="modal"
                              data-bs-target="#productModalId"
                              title="Detail"
                              onClick={() =>
                                handleProductDetail(item.productId, event)
                              }
                            >
                              <i className="fal fa-search"></i>
                            </a>
                          </div>
                        </div>
                        <div className="product__content p-relative">
                          <div className="product__content-inner">
                            <h4>
                              <a href="product-details.html">
                                {item.productName} có {item.productId}
                              </a>
                            </h4>
                            <div className="product__price transition-3">
                              <span>${item.priceDefault}.00</span>
                              <span className="old-price">$96</span>
                            </div>
                          </div>
                          <div className="add-cart p-absolute transition-3">
                            <a href="#">+ Add to Cart</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="row">
              <div className="col-xl-12">
                <div className="product__load-btn text-center mt-25">
                  <a href="#" className="os-btn os-btn-3">
                    Load More
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="subscribe__area pb-100">
          <div className="container">
            <div className="subscribe__inner pt-95">
              <div className="row">
                <div className="col-xl-8 offset-xl-2 col-lg-8 offset-lg-2">
                  <div className="subscribe__content text-center">
                    <h2>Get Discount Info</h2>
                    <p>
                      Subscribe to the Outstock mailing list to receive updates
                      on new arrivals, special offers and other discount
                      information.
                    </p>
                    <div className="subscribe__form">
                      <form action="#">
                        <input
                          type="email"
                          placeholder="Subscribe to our newsletter..."
                        ></input>
                        <button className="os-btn os-btn-2 os-btn-3">
                          subscribe
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
export default HomePage;
