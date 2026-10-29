import { useContext, useEffect, useState } from "react";
import sliderImage from "/img/slider/slider-1.jpg";
import { getProductTopSelling } from "../service/ProductService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ToastContext } from "../contexts/ToastContext";
import Loading from "../components/user/Loading";
import ProductCard from "../components/user/ProductCard";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const {toast} = useContext(ToastContext);
  const [params] = useSearchParams();
  const navigator = useNavigate();
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (params?.has("verify-email") ) {
      toast.success("Xác thực email thành công");
    }
    return ;
  }, [params]);

  useEffect(() => {
    setLoading(true);
    try {
      const fetchData = async () => {
        const response = await getProductTopSelling(8);
        if (response.status === 200) {
          setLoading(false);
          setProducts(response.data.data.content);

        }
      };
      fetchData();
    }
    catch (error) {
      console.log(error);
    }
  }, []);
  if (loading){
    return (
      <Loading></Loading>
    );
  }
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
                      <ProductCard product={item}></ProductCard>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="row">
              <div className="col-xl-12">
                <div className="product__load-btn text-center mt-25">
                  <a href="#" className="os-btn os-btn-3" onClick={(e) => {
                    e.preventDefault();
                    navigator("/shop");
                  }}>
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
