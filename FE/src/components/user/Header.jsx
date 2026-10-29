import "@fortawesome/fontawesome-free/css/all.min.css";
import logo from "/img/logo/logo.png";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import { logoutApi } from "../../service/AuthService";
import { CartContext } from "../../contexts/CartContext";

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const {cartData } = useContext(CartContext);
  const [productName, setProductName] = useState("");
  const [totalPrice, setTotalPrice] = useState();
  const [quantity, setQuantity] = useState(0);
  const { user } = useContext(AuthContext);
  const { logout } = useContext(AuthContext);

  const navigator = useNavigate();
  console.log("user in header:", user);

  
 
  useEffect( () => {
    if(cartData) {
        let totalPriceAll = 0;
        let quantityAll = 0;
        for (let i = 0; i < cartData.length; i++) {
            const item = cartData[i];
            const totalPrice = item.product.priceDefault * item.quantity;
            setTotalPrice( totalPriceAll += totalPrice );
            setQuantity( quantityAll += item.quantity);            
        }
    }
}, [cartData])
  
  const handleComeBackHome = (event) => {
    event.preventDefault();
    navigator("/");
  };
  const handleOpenSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };
  const handleLogout = () => {  
    if (user) {
      logoutApi(localStorage.getItem("authToken"));
      logout();
      navigator("/");
    }
  }
  const handleSearch = (event) => {
    event.preventDefault();
    navigator(`/shop?search=${productName}`);
  }

  const handleNavigateShop = (event) => {
    event.preventDefault();
    navigator(`/shop`);
  };

  const handleNavigateLoginPage = (event) => {
    event.preventDefault();
    navigator(`/login`);
  };

  const handleNavigateRegisterPage = (event) => {
    event.preventDefault();
    navigator(`/register`);
  };
  const handleNavigateCart = (event) => {
    event.preventDefault();
    navigator(`/cart`);
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {isSearchOpen ? (
        <>
          <section className="header__search white-bg transition-3 search-opened">
            <div className="container">
              <div className="row">
                <div className="col-xl-12">
                  <div className="header__search-inner text-center">
                    <form action="#">
                      <div className="header__search-btn">
                        <a href="" className="header__search-btn-close">
                          <img src={logo} alt="logo" />
                        </a>
                      </div>
                      <div className="header__search-header">
                        <h3>Search</h3>
                      </div>
                      <div className="header__search-input p-relative">
                        <input
                          type="text"
                          placeholder="Search for products... "
                          onChange={(e) => setProductName(e.target.value)}
                        />
                        <button type="submit" onClick={handleSearch}>
                          <i className="fa-solid fa-magnifying-glass"></i>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div
            className="body-overlay transition-3 opened"
            onClick={handleOpenSearch}
          ></div>
        </>
      ) : (
        <>
          <header>
            <div
              className={`header__area box-25 header ${
                isScrolled ? "header__scroll" : "header__transparent"
              }`}
            >
              <div className="container-fluid">
                <div className="row align-items-center">
                  <div className="col-xl-6 col-lg-6">
                    <div className="main-menu d-none d-lg-block">
                      <nav>
                        <ul>
                          <li className="config-li active has-dropdown">
                            <a href="index.html" onClick={handleComeBackHome}>
                              Home
                            </a>
                          </li>
                          <li className="mega-menu has-dropdown">
                            <a href="" onClick={handleNavigateShop}>
                              Shop
                            </a>
                          </li>
                          
                          <li className="has-dropdown">
                            <a href="shop.html">About</a>
                          </li>
                          <li className="has-dropdown">
                            <a href="">Contact</a>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-2 col-md-4 col-sm-4">
                    <div className="logo">
                      <a href="" onClick={handleComeBackHome}>
                        <img src={logo} alt="logo" />
                      </a>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-4 col-md-8 col-sm-8">
                    <div className="header__right p-relative d-flex justify-content-between justify-content-sm-end align-items-center">
                      <div className="mobile-menu-btn d-lg-none">
                        <a
                          href="javascript:void(0);"
                          className="mobile-menu-toggle"
                        ></a>
                      </div>
                      <div className="header__action">
                        <ul>
                          <li>
                            <a
                              href="#"
                              className="search-toggle"
                              onClick={handleOpenSearch}
                            >
                              <i
                                className="fa-solid fa-magnifying-glass"
                                onClick={handleOpenSearch}
                              ></i>{" "}
                              Search
                            </a>
                          </li>
                          {user && (
                            <li>
                              <a className="cart">
                              <i className="fa-solid fa-cart-shopping"></i>
                                                              <span>({quantity})</span>
                              </a>

                              <div className="mini-cart">
                                <div className="mini-cart-inner">
                                  <ul className="mini-cart-list">
                                     {cartData ?.map(item => (
                                          <li key={item.id}>
                                          <div className="cart-img f-left">
                                            <a href="product-details.html">
                                              <img
                                                src={item.product.imageUrlDisplay}
                                                alt="Product Image"
                                              />
                                            </a>
                                          </div>
                                          <div className="cart-content f-left text-left">
                                            <h5>
                                              <a href="product-details.html">
                                               {item.product.productName}
                                              </a>
                                            </h5>
                                            <div className="cart-price">
                                              <span className="ammount">
                                                {item.quantity}<i className="fal fa-times"></i>
                                              </span>
                                              <span className="price">$ {item.product.priceDefault}</span>
                                            </div>
                                          </div>
                                          <div className="del-icon f-right mt-30">
                                            <a href="#">
                                              <i className="fal fa-times" onClick={(e) => {handleNavigateCart(e)}}></i>
                                            </a>
                                          </div>
                                        </li>
                                        )
                                      )
                                     }
                                    
                                  </ul>
                                  <div className="total-price d-flex justify-content-between mb-30">
                                    <span>Subtotal:</span>
                                    <span>${totalPrice}</span>
                                  </div>
                                  <div className="checkout-link">
                                    <a href="cart.html" className="os-btn" onClick={(e) => handleNavigateCart(e)}>
                                      view Cart
                                    </a>
                                    <a
                                      className="os-btn os-btn-black"
                                      href="checkout.html"
                                    >
                                      Checkout
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </li>
                          )}

                          {!user ? (
                            <li>
                              {" "}
                              <a href="javascript:void(0);">
                                <i className="fa-solid fa-bars"></i>
                              </a>
                              <ul className="extra-info">
                                <li>
                                  <div className="my-account">
                                    <ul>
                                      <li>
                                        <a
                                          href="#"
                                          onClick={handleNavigateLoginPage}
                                        >
                                          Login
                                        </a>
                                      </li>
                                      <li>
                                        <a
                                          href="cart.html"
                                          onClick={handleNavigateRegisterPage}
                                        >
                                          Create Account
                                        </a>
                                      </li>
                                    </ul>
                                  </div>
                                </li>
                              </ul>
                            </li>
                          ) : (
                            <li>
                              {" "}
                              <a href="javascript:void(0);">
                                <i className="fa-regular fa-user"></i>
                              </a>
                              <ul className="extra-info">
                                <li>
                                  <div className="my-account">
                                    <ul>
                                      <li>
                                        <a onClick={handleLogout}>Logout</a>
                                      </li>
                                      <li>
                                      <a onClick={(e) => (
                                        e.preventDefault(),
                                        navigator("/profile")
                                      )}>My Account</a>
                                    </li>
                                    {
                                      user?.scope?.includes("ROLE_ADMIN") && (
                                        <li>
                                          <a
                                            onClick={(e) => {
                                              e.preventDefault();
                                              navigator("/admin/home");
                                            }}
                                          >
                                            Admin Home
                                          </a>
                                        </li>
                                      )
                                    }
                                    </ul>
                                  </div>
                                </li>
                              </ul>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>
        </>
      )}
    </>
  );
};

export default Header;
