import { useNavigate } from "react-router-dom";
import logo from "/img/logo/logo.png";
import { useEffect, useState } from "react";
import { getListNewOrder } from "../../service/OrderService";

const AdminSidebar = () => {
  const [newOrder, setNewOrder] = useState(0);
  useEffect(() => {
    const fetchNewOrderCount = async () => {
      try {
        const response = await getListNewOrder("", 1, 10);
        setNewOrder(response.data.data.totalElements);
      } catch (error) {
        console.error("Error fetching new order count:", error);
      }
    };

    fetchNewOrderCount();
  });
  const navigator = useNavigate();
  return (
    <div className="navbar-vertical navbar nav-dashboard">
      <div className="h-100" data-simplebar>
        <a className="navbar-brand" 
        style={{ cursor: "pointer" }}
        onClick={(e) => {
            e.preventDefault();
            navigator("/");
          }
        }>
          <img src={logo} alt="logo" />
        </a>
        <ul className="navbar-nav flex-column" id="sideNavbar">
          <li className="nav-item">
            <a className="nav-link has-arrow  collapsed " href="#!">
              Dashboard
            </a>
          </li>

          <li className="nav-item">
            <div className="navbar-heading">Ecommerce</div>
          </li>

          <li className="nav-item">
            <a
              className="nav-link has-arrow "
              href="#!"
              data-bs-toggle="collapse"
              data-bs-target="#navecommerce"
              aria-expanded="false"
              aria-controls="navecommerce"
            >
              <i className="bi bi-cart nav-icon me-2 icon-xxs"></i>
              Product
            </a>

            <div
              id="navecommerce"
              className="collapse  "
              data-bs-parent="#sideNavbar"
            >
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a
                    className="nav-link has-arrow "
                    href="../pages/ecommerce-products.html"
                    onClick={(e) => {
                      e.preventDefault();
                      navigator("/admin/product");
                    }}
                  >
                    Product Management
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link has-arrow  "
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigator("/admin/product/create-product");
                    }}
                  >
                    Add Product
                  </a>
                </li>
              </ul>
            </div>
          </li>
          <li className="nav-item">
            <a
              className="nav-link has-arrow "
              href="#!"
              data-bs-toggle="collapse"
              data-bs-target="#navcategory"
              aria-expanded="false"
              aria-controls="navcategory"
            >
              <i className="bi bi-bookmark nav-icon me-2 icon-xxs"></i>
              Category
            </a>

            <div
              id="navcategory"
              className="collapse  "
              data-bs-parent="#sideNavbar"
            >
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a
                    className="nav-link has-arrow "
                    href="../pages/ecommerce.html"
                    onClick={(e) => {
                      e.preventDefault();
                      navigator("/admin/category");
                    }}
                  >
                    Category Management
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link has-arrow  "
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigator("/admin/category/create-category");
                    }}
                  >
                    Add Category
                  </a>
                </li>
              </ul>
            </div>
          </li>
          <li className="nav-item">
            <a
              className="nav-link has-arrow  collapsed "
              href="#!"
              data-bs-toggle="collapse"
              data-bs-target="#navOrder"
              aria-expanded="false"
              aria-controls="navOrder"
            >
              <i className="nav-icon me-2 icon-xxs bi bi-file-post"></i>
              Order
            </a>

            <div
              id="navOrder"
              className="collapse "
              data-bs-parent="#sideNavbar"
            >
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a
                    className="nav-link has-arrow "
                    href="../pages/mail.html"
                    onClick={(e) => {
                      e.preventDefault(), navigator("/admin/order");
                    }}
                  >
                    Orders
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link has-arrow "
                    href="../pages/mail-details.html"
                    onClick={(e) => {
                      e.preventDefault();
                      navigator("/admin/order/new-orders");
                    }}
                  >
                    New Order{" "}
                    {newOrder > 0 ? (
                      <i className="ml-2 bi bi-bell-fill"></i>
                    ) : (
                      "(0)"
                    )}
                  </a>
                </li>
              </ul>
            </div>
          </li>
          <li className="nav-item">
            <a
              className="nav-link has-arrow  collapsed "
              href="#!"
              data-bs-toggle="collapse"
              data-bs-target="#navAccount"
              aria-expanded="false"
              aria-controls="navAccount"
            >
              <i className="nav-icon me-2 icon-xxs bi bi-person"></i>
              Account
            </a>

            <div
              id="navAccount"
              className="collapse "
              data-bs-parent="#sideNavbar"
            >
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a
                    className="nav-link has-arrow "
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigator("/admin/account-management");
                    }}
                  >
                    Account Management
                  </a>
                </li>
              </ul>
            </div>
          </li>
         
          <li className="nav-item">
            <div className="navbar-heading">Authentication</div>
          </li>
          <li className="nav-item">
            <a className="nav-link  collapsed " href="#!">
              <i className="nav-icon me-2 icon-xxs bi bi-box-arrow-in-right"></i>
              Sign in
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link  collapsed " href="#!">
              <i className="nav-icon me-2 icon-xxs bi bi-box-arrow-in-left"></i>
              Sign Out
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};
export default AdminSidebar;
