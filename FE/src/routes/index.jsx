import { createBrowserRouter } from "react-router-dom";
import ProductDetailPage from "../pages/ProductDetailPage.jsx";
import ShopPage from "../pages/ShopPage.jsx";
import LayoutUser from "../components/user/LayoutUser.jsx";
import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import CartPage from "../pages/CartPage.jsx";
import { ProfilePage } from "../pages/ProfilePage.jsx";
import { AdminRoute, ProtectedRoute } from "./ProtectedRoute.jsx";
import LayoutAdmin from "../components/admin/LayouAdmin.jsx";
import AdminHomePage from "../pages/AdminPage.jsx/AdminHomePage.jsx";
import AdminAddProductPage from "../pages/AdminPage.jsx/Product/AdminAddProductPage.jsx";
import AdminProductManagePage from "../pages/AdminPage.jsx/Product/AdminProductManagePage.jsx";
import AdminUpdateProductPage from "../pages/AdminPage.jsx/Product/AdminUpdateProductPage.jsx";
import AdminAddCategoryPage from "../pages/AdminPage.jsx/Category/AdminAddCategoryPage.jsx";
import AdminCategoryManagePage from "../pages/AdminPage.jsx/Category/AdminCategoryMangePage.jsx";
import AdminUpdateCategoryPage from "../pages/AdminPage.jsx/Category/AdminUpdateCategoryPage.jsx";
import CheckOutPage from "../pages/CheckOutPage.jsx";
import AfterOrderPage from "../pages/AfterOrderPage.jsx";
import NewOrderPage from "../pages/AdminPage.jsx/Order/NewOrderPage.jsx";
import OrderDetailPage from "../pages/OrderDetailPage.jsx";
import OrderManagePage from "../pages/AdminPage.jsx/Order/OrderManagePage.jsx";
import AccountMangementPage from "../pages/AdminPage.jsx/Account/AccountManagementPage.jsx";
import LoginCallBackGooglePage from "../pages/LoginCallBackGooglePage.jsx";

const routers = createBrowserRouter([
  {
    path: "/",
    element: <LayoutUser Component={HomePage}></LayoutUser>,
  },
  {
    path: "/shop",
    element: <LayoutUser Component={ShopPage}></LayoutUser>,
  },
  {
    path: "/product-detail/:id",
    element: <LayoutUser Component={ProductDetailPage}></LayoutUser>,
  },
  {
    path: "/login",
    element: <LayoutUser Component={LoginPage}></LayoutUser>,
  },
  {
    path: "/register",
    element: <LayoutUser Component={RegisterPage}></LayoutUser>,
  },
  {
    path: "/login/callback-google",
    element: <LayoutUser Component={LoginCallBackGooglePage}></LayoutUser>,
  },

  {
    path: "/cart",
    element: (
      <ProtectedRoute>
        <LayoutUser Component={CartPage}></LayoutUser>
      </ProtectedRoute>
    ),
  },

  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <LayoutUser Component={ProfilePage}></LayoutUser>
      </ProtectedRoute>
    ),
  },
  {
    path: "/checkout",
    element: (
      <ProtectedRoute>
        <LayoutUser Component={CheckOutPage}></LayoutUser>
      </ProtectedRoute>
    ),
  },
  {
    path: "/order-details/:orderId",
    element: (
      <ProtectedRoute>
        <LayoutUser Component={OrderDetailPage}></LayoutUser>
      </ProtectedRoute>
    ),
  },

  {
    path: "/checkout/success",
    element: (
      <ProtectedRoute>
        <AfterOrderPage></AfterOrderPage>
      </ProtectedRoute>
    ),
  },


  {
    path: "/admin/home",
    element: (
      <AdminRoute>
        <LayoutAdmin Component={AdminHomePage} />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/product/create-product",
    element: (
      <AdminRoute>
        <LayoutAdmin Component={AdminAddProductPage} />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/product/update-product/:productId",
    element: (
      <AdminRoute>
        <LayoutAdmin Component={AdminUpdateProductPage} />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/product/",
    element: (
      <AdminRoute>
        <LayoutAdmin Component={AdminProductManagePage} />
      </AdminRoute>
    ),
  },

  {
    path: "/admin/category/create-category",
    element: (
      <AdminRoute>
        <LayoutAdmin Component={AdminAddCategoryPage} />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/category/",
    element: (
      <AdminRoute>
        <LayoutAdmin Component={AdminCategoryManagePage} />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/category/update-category/:categoryId",
    element: (
      <AdminRoute>
        <LayoutAdmin Component={AdminUpdateCategoryPage} />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/order/new-orders",
    element: (
      <AdminRoute>
        <LayoutAdmin Component={NewOrderPage} />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/order",
    element: (
      <AdminRoute>
        <LayoutAdmin Component={OrderManagePage} />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/account-management",
    element: (
      <AdminRoute>
        <LayoutAdmin Component={AccountMangementPage} />
      </AdminRoute>
    ),
  },
]);
export default routers;
