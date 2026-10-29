import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { getProductById, getStockQuantity } from "../service/ProductService";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Loading from "../components/user/Loading";
import AuthContext from "../contexts/AuthContext";
import { createReviewApi } from "../service/ReviewService";
import BtnAddToCart from "../components/user/button/btnAddToCart";
import { addToCart } from "../service/CartService";
import { ToastContext } from "../contexts/ToastContext";
const ProductDetailPage = () => {
  const [product, setProduct] = useState();
  const [starSelect, setStarSelect] = useState();
  const [activeTab, setActiveTab] = useState("add");
  const [content, setContent] = useState();
  const [review, setReview] = useState();
  const [quantity, setQuantity] = useState(0);
  const [quantityAvailable, setQuantityAvailable] = useState(0);
  const [colorName, setColorName] = useState();
  const [sizeName, setSizeName] = useState();
  const navigator = useNavigate();
  const { id } = useParams();
  const ref = useRef(null);
  const { user } = useContext(AuthContext);
  const { toast } = useContext(ToastContext);
  console.log(product)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const result = await getProductById(id);
        setProduct(result.data.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    fetchProduct();
  }, [review]);

  useEffect(() => {
    const data = {
      productId: id,
      colorName: colorName,
      sizeName: sizeName,
    };

    async function fetchData() {
      try {
        const res = await getStockQuantity(data);
        setQuantityAvailable(res.data.data);
      } catch (error) {
        console.error("Error fetching stock quantity:", error);
      }
    }
    fetchData();
    if (quantity > quantityAvailable) {
      toast.error("Quantity is not available");
    }
  }, [colorName, sizeName, quantity]);


  const handleDecQuantity = (e) => {
    e.preventDefault();
    setQuantity(quantity - 1);
  };
  const handleIncQuantity = (e) => {
    e.preventDefault();
    setQuantity(quantity + 1);
  };

  const handleComeBackHome = (event) => {
    event.preventDefault();
    navigator("/");
  };

  const handleAddReview = async (event) => {
    event.preventDefault();
    await setActiveTab("add");
    setActiveTab("review");
  };
  const handleChangeTab = (event, tabName) => {
    event.preventDefault();
    setActiveTab(tabName);
  };
  const handleSelectStar = (e, index) => {
    e.preventDefault();
    if (starSelect !== null && starSelect !== undefined) {
      setStarSelect(starSelect + (index + 1));
    } else {
      setStarSelect(index);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      navigator("/login");
    } else {
      if (user?.scope?.includes("ROLE_ADMIN")) {
        toast.error("Admin cannot add to cart");
        return; 
      }
      try {
        const data = {
          productId: id,
          email: user.sub,
          quantity: quantity,
          colorName: colorName,
          sizeName: sizeName,
          currentPrice :(product.priceDefault - (product.priceDefault * product.discount) / 100).toFixed(2)
        };
        await addToCart(data);
        toast.success("Add to cart successfully");
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  const handleSetColorName = (e) => {
    e.preventDefault();
    if (e.target.value === "- Please select -") {
      setColorName(null);
    } else {
      setColorName(e.target.value);
    }
  };
  const handleSetSizeName = (e) => {
    e.preventDefault();
    if (e.target.value === "- Please select -") {
      setSizeName(null);
    } else {
      setSizeName(e.target.value);
    }
  };

  const handleRemoveStar = (e, index) => {
    e.preventDefault();
    setStarSelect(index);
  };
  const handleSubmitReview = (e) => {
    e.preventDefault();
    const newData = {
      productId: id,
      email: user.sub,
      rating: starSelect,
      content: content,
    };
    createReview(newData);
  };

  const createReview = async (newData) => {
    try {
      const response = await createReviewApi(newData);
      setReview(response.data.data);
    } catch {
      toast.error("You have to order this product before review or your order is over 30 days");
    }
  };


  const handleSetContent = (e) => {
    setContent(e.target.value);
  };

  useEffect(() => {
    if (activeTab === "review") {
      if (user) {
        ref.current.focus({ behavior: "smooth" });
      } else {
        navigator("/login", { state: { from: window.location.pathname } });
      }
    }
  }, [activeTab]);

  if (!product) {
    return <Loading></Loading>;
  }

  return (
    <>
      <section
        className="page__title p-relative d-flex align-items-center"
        style={{ backgroundImage: "url('/img/page-title/page-title-1.jpg')" }}
      >
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="page__title-inner text-center">
                <h1>Product Details</h1>
                <div className="page__title-breadcrumb">
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb justify-content-center">
                      <li className="breadcrumb-item">
                        <a href="" onClick={handleComeBackHome}>
                          Home
                        </a>
                      </li>
                      <li
                        className="breadcrumb-item active"
                        aria-current="page"
                      >
                        {" "}
                        Product details
                      </li>
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="shop__area pb-65">
        <div className="shop__top grey-bg-6 pt-100 pb-90">
          <div className="container">
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <div className="product__modal-box d-flex">
                  <div className="product__modal-nav mr-20">
                    <nav>
                      <div
                        className="nav nav-tabs"
                        id="product-details"
                        role="tablist"
                      >
                        {/* Tab 1 */}
                        <a
                          className="nav-item nav-link active"
                          id="pro-one-tab"
                          data-bs-toggle="tab"
                          href="#pro-one"
                          role="tab"
                          aria-controls="pro-one"
                          aria-selected="true"
                        >
                          <div className="product__nav-img w_img-details">
                            
                              <img
                                src={product.imageUrlDisplay}
                                alt="Product Image"
                              />
                          </div>
                        </a>
                        {/* Tab 2 */}
                        <a
                          className="nav-item nav-link"
                          id="pro-two-tab"
                          data-bs-toggle="tab"
                          href="#pro-two"
                          role="tab"
                          aria-controls="pro-two"
                          aria-selected="false"
                        >
                          <div className="product__nav-img w_img-details">
                            {Array.isArray(product.productImages) && (
                              <img
                                src={product.productImages[0].productImagesUrl}
                                alt="Product Image"
                              />
                            )}
                          </div>
                        </a>
                        {/* Tab 3 */}
                        <a
                          className="nav-item nav-link"
                          id="pro-three-tab"
                          data-bs-toggle="tab"
                          href="#pro-three"
                          role="tab"
                          aria-controls="pro-three"
                          aria-selected="false"
                        >
                          <div className="product__nav-img w_img-details">
                            {Array.isArray(product.productImages) && (
                              <img
                              src={product.productImages[1].productImagesUrl}
                              alt="Product Image"
                              />
                            )}
                          </div>
                        </a>
                        {/* Tab 4 */}
                        <a
                          className="nav-item nav-link"
                          id="pro-four-tab"
                          data-bs-toggle="tab"
                          href="#pro-four"
                          role="tab"
                          aria-controls="pro-four"
                          aria-selected="false"
                        >
                          <div className="product__nav-img w_img-details">
                            {Array.isArray(product.productImages) && (
                              <img
                              src={product.productImages[2].productImagesUrl}
                              alt="Product Image"
                              />
                            )}
                          </div>
                        </a>
                      </div>
                    </nav>
                  </div>

                  {/* Nội dung của tab */}
                  <div
                    className="tab-content mb-20"
                    id="product-detailsContent"
                  >
                    {/* Tab 1 */}
                    <div
                      className="tab-pane fade show active"
                      id="pro-one"
                      role="tabpanel"
                      aria-labelledby="pro-one-tab"
                    >
                      <div className="product__modal-img product__thumb w_img-main">
                          <img
                            src={product.imageUrlDisplay}
                            alt="Product Image"
                          />
                        <div className="product__sale">
                          <span className="new">new</span>
                          <span className="percent">-{product.discount}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Tab 2 */}
                    <div
                      className="tab-pane fade"
                      id="pro-two"
                      role="tabpanel"
                      aria-labelledby="pro-two-tab"
                    >
                      <div className="product__modal-img product__thumb w_img-main">
                        {Array.isArray(product.productImages) && (
                          <img
                          src={product.productImages[0].productImagesUrl}
                          alt="Product Image"
                          />
                        )}
                        <div className="product__sale">
                          <span className="new">new</span>
                          <span className="percent">-16%</span>
                        </div>
                      </div>
                    </div>

                    {/* Tab 3 */}
                    <div
                      className="tab-pane fade"
                      id="pro-three"
                      role="tabpanel"
                      aria-labelledby="pro-three-tab"
                    >
                      <div className="product__modal-img product__thumb w_img-main">
                        {Array.isArray(product.productImages) && (
                          <img
                          src={product.productImages[1].productImagesUrl}
                          alt="Product Image"
                          />
                        )}
                        <div className="product__sale">
                          <span className="new">new</span>
                          <span className="percent">-16%</span>
                        </div>
                      </div>
                    </div>

                    {/* Tab 4 */}
                    <div
                      className="tab-pane fade"
                      id="pro-four"
                      role="tabpanel"
                      aria-labelledby="pro-four-tab"
                    >
                      <div className="product__modal-img product__thumb w_img-main">
                        {Array.isArray(product.productImages) && (
                          <img
                          src={product.productImages[2].productImagesUrl}
                          alt="Product Image"
                          />
                        )}
                        <div className="product__sale">
                          <span className="new">new</span>
                          <span className="percent">-16%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-6 col-lg-6">
                <div className="product__modal-content product__modal-content-2">
                  <h4>
                    <a href="product-details.html">{product.productName}</a>
                  </h4>
                  <div className="rating rating-shop mb-15">
                    <ul>
                      {Number.isInteger(product.averageRatings) ? (
                        <>
                          {product.averageRatings >= 1 ? (
                            <>
                              {[...Array(product.averageRatings)].map(
                                (_, index) => (
                                  <li key={index}>
                                    <span>
                                      <i className="fas fa-star"></i>
                                    </span>
                                  </li>
                                )
                              )}

                              {[...Array(5 - product.averageRatings)].map(
                                (_, index) => (
                                  <li key={index}>
                                    <span>
                                      <i className="fal fa-star"></i>
                                    </span>
                                  </li>
                                )
                              )}
                            </>
                          ) : (
                            <>
                              {[...Array(5)].map((_, index) => (
                                <li key={index}>
                                  <span>
                                    <i className="fal fa-star"></i>
                                  </span>
                                </li>
                              ))}
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {product.averageRatings > 0 &&
                          product.averageRatings < 1 ? (
                            <>
                              {[...Array(1)].map((_, index) => (
                                <li key={index}>
                                  <span>
                                    <i className="fa-regular fa-star-half-stroke"></i>
                                  </span>
                                </li>
                              ))}
                            </>
                          ) : product.averageRatings === 0 ? (
                            <>
                              {[...Array(5)].map((_, index) => (
                                <li key={index}>
                                  <span>
                                    <i className="fal fa-star"></i>
                                  </span>
                                </li>
                              ))}
                            </>
                          ) : (
                            <>
                              {[
                                ...Array(Math.floor(product.averageRatings)),
                              ].map((_, index) => (
                                <li key={index}>
                                  <span>
                                    <i className="fas fa-star"></i>
                                  </span>
                                </li>
                              ))}

                              {[...Array(1)].map((_, index) => (
                                <li key={index}>
                                  <span>
                                    <i className="fa-regular fa-star-half-stroke"></i>
                                  </span>
                                </li>
                              ))}
                              {[
                                ...Array(
                                  5 - (Math.floor(product.averageRatings) + 1)
                                ),
                              ].map((_, index) => (
                                <li key={index}>
                                  <span>
                                    <i className="fal fa-star"></i>
                                  </span>
                                </li>
                              ))}
                            </>
                          )}
                        </>
                      )}
                      <span className="rating-no ml-10">
                        {product.averageRatings}
                      </span>
                    </ul>
                    <span className="rating-no ml-10 rating-left">
                      {product.reviewResponses.length} rating(s)
                    </span>
                    <span className="review rating-left">
                      <a href="#" onClick={handleAddReview}>
                        Add your Review
                      </a>
                    </span>
                  </div>
                  <div className="product__price-2 mb-25">
                    <span>${(product.priceDefault - (product.priceDefault * product.discount) / 100).toFixed(2)}</span>
                    <span className="old-price">${product.priceDefault}.00</span>
                  </div>
                  <div className="product__modal-des mb-30">
                    <p>{product.description}</p>
                  </div>
                  <div className="product__modal-form mb-30">
                    <form action="#">
                      <div className="product__modal-input color mb-20">
                        <label>
                          Color <i className="fas fa-star-of-life"></i>
                        </label>
                        <select
                          value={colorName}
                          onChange={(e) => handleSetColorName(e)}
                        >
                          <option>- Please select -</option>
                          {[
                            ...new Set(
                              product.productVariants?.map(
                                (item) => item.colorName
                              )
                            ),
                          ].map((colorName, index) => (
                            <option key={index}>{colorName}</option>
                          ))}
                        </select>
                      </div>
                      <div className="product__modal-input size mb-20">
                        <label>
                          Size <i className="fas fa-star-of-life"></i>
                        </label>
                        <select
                          value={sizeName}
                          onChange={(e) => handleSetSizeName(e)}
                        >
                          <option>- Please select -</option>
                          {[
                            ...new Set(
                              product.productVariants?.map(
                                (item) => item.sizeName
                              )
                            ),
                          ].map((sizeName, index) => (
                            <option key={index}>{sizeName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-5">
                        <span>Quantity Available: {quantityAvailable} </span>
                      </div>
                      <div className="pro-quan-area d-sm-flex align-items-center">
                        <div className="product-quantity-title">
                          <label>Quantity</label>
                        </div>
                        <div className="product-quantity mr-20 mb-20">
                          <div className="cart-plus-minus">
                            <button
                              className="dec qtybutton"
                              onClick={(e) => handleDecQuantity(e)}
                            >
                              -
                            </button>
                            <input type="text" value={quantity} />
                            <button
                              className="inc qtybutton "
                              onClick={(e) => handleIncQuantity(e)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="pro-cart-btn">
                          <BtnAddToCart
                            handleAddToCart={handleAddToCart}
                          ></BtnAddToCart>
                        </div>
                      </div>
                    </form>
                  </div>
                  <div className="product__tag mb-25">
                    <span>Category:</span>
                    <span>
                      <a href="#">{product.category?.categoryName}</a>
                    </span>
                  </div>
                  <div className="product__share">
                    <span>Share :</span>
                    <ul>
                      <li>
                        <a href="#">
                          <i className="fab fa-facebook-f"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fab fa-twitter"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fab fa-behance"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fab fa-linkedin-in"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fab fa-youtube"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="shop__bottom">
          <div className="container">
            <div className="row">
              <div className="col-xl-12">
                <div className="product__details-tab">
                  <div className="product__details-tab-nav text-center mb-45">
                    <nav>
                      <div
                        className="nav nav-tabs justify-content-start justify-content-sm-center"
                        id="pro-details"
                        role="tablist"
                      >
                        <a
                          className={`nav-item nav-link ${
                            activeTab === "add" ? "active" : " "
                          } `}
                          id="add-tab"
                          data-bs-toggle="tab"
                          href="#add"
                          role="tab"
                          aria-controls="add"
                          aria-selected="false"
                          onClick={(e) => handleChangeTab(e, "add")}
                        >
                          Additional Information
                        </a>
                        <a
                          className={`nav-item nav-link ${
                            activeTab === "review" ? "active" : " "
                          } `}
                          id="review-tab"
                          data-bs-toggle="tab"
                          href="#review"
                          role="tab"
                          aria-controls="review"
                          aria-selected="false"
                          onClick={(e) => handleChangeTab(e, "review")}
                        >
                          Reviews ({product.reviewResponses.length})
                        </a>
                      </div>
                    </nav>
                  </div>
                  <div className="tab-content" id="pro-detailsContent">
                    <div
                      className={`tab-pane fade ${
                        activeTab === "add" ? "show active" : ""
                      }`}
                      id="add"
                      role="tabpanel"
                    >
                      <div className="product__details-add">
                        <ul>
                          <li>
                            <span>Weight</span>
                          </li>
                          <li>
                            <span>
                              {" "}
                              {product.productVariants
                                ?.map((item) => item.sizeName)
                                .join(", ")}{" (kg) "}
                              :{" "}
                              {product.productVariants
                                ?.map((item) => item.weight)
                                .join(", ")}{" "}
                            </span>{" "}
                          </li>{" "}
                          <li>
                            {" "}
                            <span>Dimention</span>{" "}
                          </li>{" "}
                          <li>
                            {" "}
                            <span>
                              {" "}
                              {product.productVariants
                                ?.map((item) => item.sizeName)
                                .join(", ")}{" (cm) "}
                              :{" Height: "}
                              {product.productVariants
                                ?.map((item) => item.height)
                                .join(", ")}{" "}
                              :{" Length: "}
                              {product.productVariants
                                ?.map((item) => item.length)
                                .join(", ")}{" "}
                              :{"Width: "}
                              {product.productVariants
                                ?.map((item) => item.width)
                                .join(", ")}{" "}
                            </span>{" "}
                          </li>{" "}
                          <li>
                            {" "}
                            <span>Size</span>{" "}
                          </li>{" "}
                          <li>
                            {" "}
                            <span>
                              {" "}
                              {product.productVariants
                                ?.map((item) => item.sizeName)
                                .join(", ")}{" "}
                            </span>{" "}
                          </li>{" "}
                        </ul>{" "}
                      </div>
                    </div>

                    <div
                      className={`tab-pane fade ${
                        activeTab === "review" ? "show active" : ""
                      }`}
                      id="review"
                      role="tabpanel"
                    >
                      <div className="product__details-review">
                        <div className="postbox__comments">
                          <div className="postbox__comment-title mb-30">
                            <h3>Reviews </h3>
                          </div>
                          <div className="latest-comments mb-30">
                            <ul>
                              <li>
                                <div className="comments-box">
                                  <div className="comments-avatar">
                                    <img
                                      src="assets/img/blog/comments/avater-1.png"
                                      alt=""
                                    ></img>
                                  </div>
                                  {product.reviewResponses?.map((item) => (
                                    <div
                                      className="comments-text"
                                      key={item.id}
                                    >
                                      <div className="avatar-name">
                                        <h5>{item.username}</h5>
                                        <span>
                                          {" "}
                                          -{" "}
                                          {formatDistanceToNow(
                                            new Date(item.createdAt),
                                            { addSuffix: true, locale: vi }
                                          )}
                                        </span>
                                      </div>
                                      <div className="user-rating">
                                        <ul>
                                          {[...Array(item.rating + 1)].map(
                                            (_, index) => (
                                              <li key={index}>
                                                <a href="#">
                                                  <i className="fas fa-star"></i>
                                                </a>
                                              </li>
                                            )
                                          )}
                                          {[...Array(4 - item.rating)].map(
                                            (_, index) => (
                                              <li key={index}>
                                                <a href="#">
                                                  <i className="fal fa-star"></i>
                                                </a>
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                      <p>{item.content}</p>
                                    </div>
                                  ))}
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="post-comments-form mb-100">
                          <div className="post-comments-title mb-30">
                            <h3>Your Review</h3>
                            <div className="post-rating">
                              <span>Your Rating :</span>
                              <ul>
                                {starSelect !== null &&
                                starSelect !== undefined ? (
                                  <>
                                    {[...Array(starSelect + 1)].map(
                                      (_, index) => {
                                        return (
                                          <li key={index}>
                                            <a
                                              onClick={(e) =>
                                                handleRemoveStar(e, index)
                                              }
                                            >
                                              <i className="fas fa-star"></i>
                                            </a>
                                          </li>
                                        );
                                      }
                                    )}
                                    {[...Array(5 - (starSelect + 1))].map(
                                      (_, index) => {
                                        return (
                                          <li key={index}>
                                            <a
                                              onClick={(e) =>
                                                handleSelectStar(e, index)
                                              }
                                            >
                                              <i className="fal fa-star"></i>
                                            </a>
                                          </li>
                                        );
                                      }
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {[...Array(5)].map((_, index) => {
                                      return (
                                        <li key={index}>
                                          <a
                                            href="#"
                                            onClick={(e) =>
                                              handleSelectStar(e, index)
                                            }
                                          >
                                            <i className="fal fa-star"></i>
                                          </a>
                                        </li>
                                      );
                                    })}
                                  </>
                                )}
                              </ul>
                            </div>
                          </div>
                          <form
                            id="contacts-form"
                            className="conatct-post-form"
                            onSubmit={(e) => handleSubmitReview(e)}
                          >
                            <div className="row">
                              <div className="col-xl-12">
                                <div className="contact-icon p-relative contacts-message">
                                  <textarea
                                    name="comments"
                                    id="comments"
                                    cols="30"
                                    rows="10"
                                    placeholder="Comments"
                                    ref={ref}
                                    onChange={(e) => handleSetContent(e)}
                                  ></textarea>
                                </div>
                              </div>
                              <div className="col-xl-12">
                                <button className="os-btn os-btn-black">
                                  Post comment
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default ProductDetailPage;
