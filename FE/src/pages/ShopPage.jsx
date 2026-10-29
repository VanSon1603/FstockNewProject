import { useEffect, useState } from "react";

import { useSearchParams } from "react-router-dom";
import { listCategories } from "../service/CategoryService";
import {
  getColorNames,
  getProductByFilter,
  getProductTopSelling,
  getSizeNames,
} from "../service/ProductService";
import ErrorCom from "../components/user/Error";
import ProductCard from "../components/user/ProductCard";
import Pagination from "../components/user/Pagination";
import BtnAddToCart from "../components/user/button/btnAddToCart";
const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [productFeatured, setProductFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchParam, setSearchParam] = useSearchParams();
  const [selectedPrice, setSelectedPrice] = useState({ min: null, max: null });
  const [totalPage, setTotalPage] = useState(1);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);

  const [error, setError] = useState({
    statusCode: null,
    message: null,
  });

  const [filter, setFilter] = useState({
    category: null,
    priceMin: null,
    priceMax: null,
    color: null,
    size: null,
    productName: null,
    sortBy: null,
    pageNumber: 1,
  });
  const [appliedFilter, setAppliedFilter] = useState({
    category: null,
    priceMin: null,
    priceMax: null,
    color: null,
    size: null,
  });

  const search = searchParam.get("search") || "";
  useEffect(() => {
    if (search) {
      setFilter((prev) => ({
        ...prev,
        productName: search,
      }));
    }
  }, [search]);
  
  // lấy ra các cặp key value và biến nó thành 1 object mới chỉ chứa các cặp key value này
  const filtered = Object.entries(appliedFilter)
    .filter(([key, value]) => value !== null)
    .reduce((acc, [key, value]) => {
      if (key === "priceMin" || key === "priceMax") {
        acc["priceRange"] =
          "$" +
          (appliedFilter.priceMin || 0) +
          " - " +
          "$" +
          (appliedFilter.priceMax || ">");
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});

  // kiểm tra có giá trị nào khác null không
  const hasNonNullValue = Object.values(appliedFilter).some(
    (value) => value !== null
  );
  // biến các giá trị của các trường trong filtered thành mảng
  const values = Object.values(filtered);

  const priceRanges = [
    { label: "Under $25", value: { min: 0, max: 25 } },
    { label: "$26 to $50", value: { min: 26, max: 50 } },
    { label: "$51 to $100", value: { min: 51, max: 100 } },
    { label: "$101 to $200", value: { min: 101, max: 200 } },
    { label: "$201 to $300", value: { min: 201, max: 300 } },
    { label: "$301 to $400", value: { min: 301, max: 400 } },
    { label: "$401 to $500", value: { min: 401, max: 500 } },
    { label: "Over $500", value: { min: 500, max: null } },
  ];

  useEffect(() => {
    listCategories()
      .then((result) => {
        setCategories(result.data.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    const fetchColors = async () => {
      const result = await getColorNames();
      setColors(result.data.data);
    };
    fetchColors();
  }, []);
  console.log(colors);

  useEffect(() => {
    const fetchSizes = async () => {
      const result = await getSizeNames();
      setSizes(result.data.data);
    };
    fetchSizes();
  }, []);

  useEffect(() => {
    getProductByFilter(filter)
      .then((result) => {
        setProducts(result.data.data.content);
        setTotalPage(result.data.data.totalPages);
        const filteredParams = Object.fromEntries(
          Object.entries({
            priceMin: filter.priceMin,
            priceMax: filter.priceMax,
            category: filter.category,
            color: filter.color,
            size: filter.size,
            productName: filter.productName,
            sortBy: filter.sortBy,
            pageNumber: filter.pageNumber,
            //lọc bỏ các phần tử có giá trị null
          }).filter(([, value]) => value !== null && value !== undefined)
        );
        console.log("products", result.data.data.content);
        setSearchParam(filteredParams);
        setError(null);
        if (filter.productName){
          setFilter((prev) => ({
            ...prev,
            productName: null,
          }));
        }
      })
      .catch((err) => {
        setError({
          statusCode: err.response.status,
          message: err.response.data.message,
        });
      });
  }, [filter]);
  useEffect(() => {
    const fetchProductFeatured = async () => {
      const res = await getProductTopSelling(3);
      setProductFeatured(res.data.data.content);
    };
    fetchProductFeatured();
  }, [])

  const handleFilterChange = (key, value1, value2) => {
    setFilter((prev) => ({
      ...prev,
      [key]: value1,
    }));
    if (value2) {
      setAppliedFilter((prev) => ({
        ...prev,
        [key]: value2,
      }));
    }
  };
  const handleChangePriceRange = (price) => {
    setSelectedPrice(price);
    handleFilterChange("priceMin", price.min, price.min);
    handleFilterChange("priceMax", price.max, price.max);
  };

  const handleRemoveFilterTag = (value) => {
    const colorToRemove = colors.find((color) => color.colorName === value);
    const categoryToRemove = categories.find(
      (category) => category.categoryName === value
    );
    const sizeToRemove = sizes.find((size) => size === value);
    const priceToRemove = value.match(/\d+/g);

    if (colorToRemove) {
      setFilter((prev) => ({
        ...prev,
        color: null,
      }));
      setAppliedFilter((prev) => ({
        ...prev,
        color: null,
      }));
    }
    if (categoryToRemove) {
      setFilter((prev) => ({
        ...prev,
        category: null,
      }));
      setAppliedFilter((prev) => ({
        ...prev,
        category: null,
      }));
    }
    if (sizeToRemove) {
      setFilter((prev) => ({
        ...prev,
        size: null,
      }));
      setAppliedFilter((prev) => ({
        ...prev,
        size: null,
      }));
    }
    if (priceToRemove !== null) {
      if (priceToRemove.length > 1) {
        setFilter((prev) => ({
          ...prev,
          priceMin: null,
          priceMax: null,
        }));
        setAppliedFilter((prev) => ({
          ...prev,
          priceMin: null,
          priceMax: null,
        }));
      } else {
        setFilter((prev) => ({
          ...prev,
          priceMin: null,
        }));
        setAppliedFilter((prev) => ({
          ...prev,
          priceMin: null,
        }));
      }
    }
  };

  const handleAddToCartList = (e, productId) => {
    e.preventDefault();
    navigator(`/product-detail/${productId}`);
  };

  return (
    <section className="shop__area pt-100 pb-100">
      <div className="container">
        <div className="row">
          <div className="col-xl-3 col-lg-3 col-md-4">
            <div className="shop__sidebar">
              <div className="sidebar__widget mb-55">
                <div className="sidebar__widget-title mb-25">
                  <h3>Applied Filter</h3>
                </div>

                <div className="sidebar__widget-content">
                  <div className="filter d-flex flex-column">
                    {hasNonNullValue ? (
                      values.map((value) => {
                        return (
                          <div className="filter-tag d-flex" key={value}>
                            <span>{value}</span>
                            <button
                              className="remove-filter text-center"
                              onClick={() => handleRemoveFilterTag(value)}
                            >
                              x
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div> </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="sidebar__widget mb-55">
                <div className="sidebar__widget-title mb-25">
                  <h3>Product Categories</h3>
                </div>
                <div className="sidebar__widget-content">
                  <div className="categories">
                    <div id="accordion">
                      <div className="card">
                        <div className="card-header white-bg" id="accessories">
                          <h5 className="mb-0">
                            <button
                              className="shop-accordion-btn collapsed"
                              data-bs-toggle="collapse"
                              data-bs-target="#collapseAccessories"
                              aria-expanded="true"
                              aria-controls="collapseAccessories"
                            >
                              More Categories
                            </button>
                          </h5>
                        </div>

                        <div
                          id="collapseAccessories"
                          className="collapse show"
                          aria-labelledby="accessories"
                          data-parent="#accordion"
                        >
                          <div className="card-body">
                            <div className="categories__list">
                              <ul>
                                {categories.map((item) => (
                                  <li key={item.categoryId}>
                                    <a
                                      href="#"
                                      onClick={(event) => {
                                        event.preventDefault();
                                        handleFilterChange(
                                          "category",
                                          item.categoryId,
                                          item.categoryName
                                        );
                                      }}
                                    >
                                      {item.categoryName}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sidebar__widget mb-55">
                <div className="sidebar__widget-title mb-30">
                  <h3>Filter By Price</h3>
                </div>
                <div className="sidebar__widget-content">
                  <div className="">
                    {priceRanges.map((item) => (
                      <label
                        key={JSON.stringify(item.value)}
                        style={{ display: "block", cursor: "pointer" }}
                      >
                        <input
                          type="radio"
                          name="price"
                          value={JSON.stringify(item.value)}
                          checked={
                            JSON.stringify(selectedPrice) ===
                            JSON.stringify(item.value)
                          }
                          onClick={(e) =>
                            handleChangePriceRange(JSON.parse(e.target.value))
                          }
                          style={{ marginRight: "8px" }}
                        />
                        {item.label} <span style={{ color: "brown" }}></span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="sidebar__widget mb-55">
                <div className="sidebar__widget-title mb-30">
                  <h3>Any Size</h3>
                </div>
                <div className="sidebar__widget-content">
                  <div className="size">
                    <ul>
                      {sizes.map((item, index) => (
                        <li key={index}>
                          <a
                            href="#"
                            onClick={(event) => {
                              event.preventDefault();
                              handleFilterChange("size", item, item);
                            }}
                          >
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="sidebar__widget mb-60">
                <div className="sidebar__widget-title mb-20">
                  <h3>Choose Color</h3>
                </div>
                <div className="sidebar__widget-content">
                  <div className="color__pick">
                    <ul>
                      {colors.map((item, index) => (
                        <li key={index}>
                          <button
                            className="color-hover"
                            type="button"
                            style={{
                              background: item.colorCode,
                            }}
                            onClick={() =>
                              handleFilterChange(
                                "color",
                                item.colorName,
                                item.colorName
                              )
                            }
                          ></button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="sidebar__widget">
                <div className="sidebar__widget-title mb-30">
                  <h3>Featured Products</h3>
                </div>
                <div className="sidebar__widget-content">
                  <div className="features__product">
                    <ul>
                    {productFeatured.map((item) => (
                      <li className="mb-20" key={item.productId}>
                        <div className="featires__product-wrapper d-flex">
                          <div className="features__product-thumb mr-15">
                            <a href="product-details.html">
                              <img
                                src={item.imageUrlDisplay}
                                style={{width: "70px", height: "80px"}}
                                alt="pro-sm-1"
                              ></img>
                            </a>
                          </div>
                          <div className="features__product-content">
                            <h5>
                              <a href="product-details.html">
                               {item.productName}
                              </a>
                            </h5>
                            <div className="price">
                              <span>$</span>
                              <span className="price-old">${item.priceDefault}</span>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                      
                      
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-9 col-lg-9 col-md-8">
            <div className="shop__content-area">
              <div className="shop__header d-sm-flex justify-content-between align-items-center mb-40">
                <div className="shop__header-left">
                  <div className="show-text">
                    <span>Showing 1–12 of 20 results</span>
                  </div>
                </div>
                <div className="shop__header-right d-flex align-items-center justify-content-between justify-content-sm-end">
                  <div className="sort-wrapper mr-30 pr-25 p-relative">
                    <select onChange={(e) => handleFilterChange("sortBy", e.target.value)}>
                      <option value="" >Default Sorting</option>
                      <option value="RatingAsc">Rating Ascending</option>
                      <option value="RatingDesc">Rating Descrease</option>
                      <option value="PriceDesc">Price Descrease</option>
                      <option value="PriceAsc">Price Ascending</option>
                    </select>
                  </div>
                  <ul className="nav nav-pills" id="pills-tab" role="tablist">
                    <li className="nav-item">
                      <a
                        className="nav-link active"
                        id="pills-grid-tab"
                        data-bs-toggle="pill"
                        href="#pills-grid"
                        role="tab"
                        aria-controls="pills-grid"
                        aria-selected="true"
                      >
                        <i className="fas fa-th"></i>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link"
                        id="pills-list-tab"
                        data-bs-toggle="pill"
                        href="#pills-list"
                        role="tab"
                        aria-controls="pills-list"
                        aria-selected="false"
                      >
                        <i className="fas fa-list-ul"></i>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="tab-content" id="pills-tabContent">
                <div
                  className="tab-pane fade show active"
                  id="pills-grid"
                  role="tabpanel"
                  aria-labelledby="pills-grid-tab"
                >
                  {/* danh sách sản phẩm theo dạng lưới*/}

                  <div className="row custom-row-10 ">
                    {error != null ? (
                      <ErrorCom messageProps={error}></ErrorCom>
                    ) : (
                      products.map((item) => (
                        <div
                          className="col-xl-4 col-lg-4 col-md-6 col-sm-6 custom-col-10"
                          key={item.productId}
                        >
                          <ProductCard product={item}></ProductCard>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* danh sách sản phẩm hiển thị theo dạng lits */}

                <div
                  className="tab-pane fade"
                  id="pills-list"
                  role="tabpanel"
                  aria-labelledby="pills-list-tab"
                >
                {products.map((item) => {
                  return (
                    <div className="product__wrapper mb-40" key={item.productId}>
                      <div className="row">
                        <div className="col-xl-4 col-lg-4">
                          <div className="product__thumb">
                            <a href="product-details.html" className="w-img">
                              <img
                                src={item.imageUrlDisplay}
                                alt="product-img"
                              ></img>
                             
                            </a>
                            {item?.discount && item.discount > 0 && (
                              <div className="product__sale">
                                <span className="new">new</span>
                                <span className="percent">-{item.discount}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-xl-8 col-lg-8">
                          <div className="product__content p-relative">
                            <div className="product__content-inner list">
                              <h4>
                                <a href="product-details.html">
                                  {item.productName}
                                </a>
                              </h4>
                              <div className="product__price-2 mb-10">
                                <span>$96.00</span>
                                <span className="old-price">${item.priceDefault}</span>
                              </div>
                              <p>
                                {item.description}
                              </p>
                              
                            </div>
                            <div className="add-cart-list d-sm-flex align-items-center">
                              <BtnAddToCart></BtnAddToCart>
                              <div className="product__action-2 transition-3 mr-20">
                                <a
                                  data-bs-toggle="tooltip"
                                  data-placement="top"
                                  title="Add to Wishlist"
                                >
                                  <i className="fal fa-heart"></i>
                                </a>
                                <a
                                  data-bs-toggle="tooltip"
                                  data-placement="top"
                                  title="Compare"
                                >
                                  <i className="fal fa-sliders-h"></i>
                                </a>
                                <a
                                  data-bs-toggle="modal"
                                  data-bs-target="#productModalId"
                                  onClick={(e)=> {
                                    handleAddToCartList(e, item.productId);
                                  }}
                                >
                                  <i className="fal fa-search"></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
              <div className="row mt-40">
                <div className="col-xl-12">
                  <Pagination
                    totalPage={totalPage}
                    handlePageNumber={handleFilterChange}
                  ></Pagination>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default ShopPage;
