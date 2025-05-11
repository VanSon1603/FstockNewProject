import { useContext, useEffect, useState } from "react";
import Banner from "../components/user/Banner";
import { CartContext } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { changeInfo, changePassword, getInfo } from "../service/UserService";
import AuthContext from "../contexts/AuthContext";
import { ToastContext } from "../contexts/ToastContext";
import Loading from "../components/user/Loading";
import { logoutApi } from "../service/AuthService";
import { useForm } from "react-hook-form";
import { getOrdersByEmail } from "../service/OrderService";
import { format } from "date-fns";

export const ProfilePage = () => {
  const { cartData } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { logout } = useContext(AuthContext);
  const { toast } = useContext(ToastContext);
  const [quantity, setQuantity] = useState(0);
  const [userData, setUserData] = useState();
  const [orderData, setOrderData] = useState();
  const [image, setImage] = useState();
  const navigator = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const changePasswordOptions = {
    oldPassword: {
      required: "Old password must not be blank",
    },
    newPassword: {
      required: "New password must not be blank",
      pattern: {
        value: /^(?=.*[A-Z])(?=.*[@#$%^&+=!.()+ =]).{8,}$/,
        message:
          "Password must have at least 8 characters, one uppercase letter, and one special character",
      },
    },
    confirmPassword: {
      required: "Confirm password must not be blank",
      pattern: {
        value: /^(?=.*[A-Z])(?=.*[@#$%^&+=!.()+ =]).{8,}$/,
        message:
          "Password must have at least 8 characters, one uppercase letter, and one special character",
      },
    },
  };
  const changeInfoOptions = {
    userName: {
      required: "Old password must not be blank",
    },
    phone: {
      required: "Phone must not be blank",
      pattern: {
        value: /^(0[0-9]{9,11})$/,
        message: "Invalid phone number format",
      },
    },
    imgUrlDisplay: {
      validate: (value) => {
        if (value.length != 1) {
          return "You should  select  1 images";
        }
        return true;
      },
    },
  };
  const statusDescriptions = {
    PENDING: "Đang chờ xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPED: "Đã giao hàng",
    PAID: "Đã thanh toán",
    REFUNDING: "Đang hoàn tiền",
    REFUNDED: "Đã hoàn tiền",
    REJECT: "Đã từ chối",
    COMPLETED: "Hoàn thành",
    SHIPPING: "Đang giao hàng",
    RETURNED: "Đã trả hàng",
    CANCELED: "Đã hủy",
  };

  useEffect(() => {
    if (cartData) {
      let quantityAll = 0;
      for (let i = 0; i < cartData.length; i++) {
        const item = cartData[i];
        setQuantity((quantityAll += item.quantity));
      }
    }
  }, [cartData]);

  useEffect(() => {
    try {
      if (user) {
        const fetchDataUser = async () => {
          const userData = await getInfo();
          setUserData(userData.data.data);
        };
        fetchDataUser();
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }, [user]);

  useEffect(() => {
    try {
      if (user) {
        const fetchDataOrder = async () => {
          const res = await getOrdersByEmail(user.sub);
          setOrderData(res.data.data);
        };
        fetchDataOrder();
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }, [user]);

  const handleLogout = (e) => {
    e.preventDefault();
    logoutApi(localStorage.getItem("authToken"));
    logout();
    navigator("/");
  };

  const onSubmitChangePass = async (data) => {
    try {
      const res = await changePassword(data);
      if (res.status === 200) {
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const onSubmitChangeInfo = async (data) => {
    const formData = new FormData();
    formData.append("userName", data.userName);
    formData.append("phone", data.phone);
    formData.append("email", userData?.email);
    if (data.imgUrlDisplay.length > 0) {
      formData.append("imgUrlDisplay", data.imgUrlDisplay[0]);
    }
    try {
      const res = await changeInfo(formData);
      if (res.status === 200) {
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  if (!user) {
    return <Loading></Loading>;
  }

  return (
    <>
      <Banner pageName={"Profile"}></Banner>
      <section className="profile__area pt-120 pb-50 grey-bg">
        <div className="container">
          <div className="profile__basic-inner pb-20 bg-white">
            <div className="row align-items-center">
              <div className="col-xxl-6 col-md-6">
                <div className="profile__basic d-md-flex align-items-center">
                  <div className="profile__basic-thumb mr-30">
                    <img src={userData?.imgUrlDisplay} alt=""></img>
                  </div>
                  <div className="profile__basic-content">
                    <h3 className="profile__basic-title">
                      Welcome Back <span>{userData?.userName}</span>
                    </h3>
                  </div>
                </div>
              </div>
              <div className="col-xxl-6 col-md-6">
                <div className="profile__basic-cart d-flex align-items-center justify-content-md-end">
                  <div className="cart-info mr-10">
                    <a
                      href="cart.html"
                      onClick={(e) => (e.preventDefault(), navigator("/cart"))}
                    >
                      View cart
                    </a>
                  </div>
                  <div className="cart-item">
                    <a href="cart.html" onClick={(e) => e.preventDefault()}>
                      <i className="fa-solid fa-cart-shopping"></i>
                      <span className="cart-quantity">{quantity}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="profile__menu pb-70 grey-bg">
        <div className="container">
          <div className="row">
            <div className="col-xxl-4 col-md-4">
              <div className="profile__menu-left bg-white mb-50">
                <h3 className="profile__menu-title">
                  <i className="fa fa-list-alt"></i> Your Menu
                </h3>
                <div className="profile__menu-tab">
                  <div
                    className="nav nav-tabs flex-column justify-content-start text-start"
                    id="nav-tab"
                    role="tablist"
                  >
                    <button
                      className="nav-link active"
                      id="nav-account-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-account"
                      type="button"
                      role="tab"
                      aria-controls="nav-account"
                      aria-selected="true"
                    >
                      {" "}
                      <i className="fa fa-user"></i> My Account
                    </button>
                    <button
                      className="nav-link"
                      id="nav-order-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-order"
                      type="button"
                      role="tab"
                      aria-controls="nav-order"
                      aria-selected="false"
                    >
                      <i className="fa fa-file"></i>Orders
                    </button>
                    {userData?.accountType === "LOCAL" && (
                      <button
                        className="nav-link"
                        id="nav-password-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#nav-password"
                        type="button"
                        role="tab"
                        aria-controls="nav-password"
                        aria-selected="false"
                      >
                        <i className="fa fa-lock"></i>Change Password
                      </button>
                    )}

                    <button
                      className="nav-link"
                      onClick={(e) => handleLogout(e)}
                    >
                      <i className="fa fa-sign-out"></i> Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-8 col-md-8">
              <div className="profile__menu-right">
                <div className="tab-content" id="nav-tabContent">
                  <div
                    className="tab-pane fade show active"
                    id="nav-account"
                    role="tabpanel"
                    aria-labelledby="nav-account-tab"
                  >
                    <div className="profile__info">
                      <div className="profile__info-top d-flex justify-content-between align-items-center">
                        <h3 className="profile__info-title">
                          Profile Information
                        </h3>
                        <button
                          className="profile__info-btn"
                          type="button"
                          data-bs-toggle="modal"
                          data-bs-target="#profile_edit_modal"
                        >
                          <i className="fa-regular fa-pen-to-square"></i> Edit
                          Profile
                        </button>
                      </div>

                      <div className="profile__info-wrapper white-bg">
                        <div className="profile__info-item">
                          <p>Fisrt name</p>
                          <h4>{userData?.firstName}</h4>
                        </div>
                        <div className="profile__info-item">
                          <p>Last name</p>
                          <h4>{userData?.lastName}</h4>
                        </div>
                        <div className="profile__info-item">
                          <p>Name</p>
                          <h4>{userData?.userName}</h4>
                        </div>
                        <div className="profile__info-item">
                          <p>Email</p>
                          <h4>
                            <a className="__cf_email__">{userData?.email}</a>
                          </h4>
                        </div>
                        <div className="profile__info-item">
                          <p>Phone</p>
                          <h4>{userData?.phone}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="tab-pane fade"
                    id="nav-order"
                    role="tabpanel"
                    aria-labelledby="nav-order-tab"
                  >
                    <div className="order__info">
                      <div className="order__info-top d-flex justify-content-between align-items-center">
                        <h3 className="order__info-title">My Orders</h3>
                        <button type="button" className="order__info-btn">
                          <i className="fa-regular fa-trash-can"></i> Clear
                        </button>
                      </div>
                      <div className="order__info-top d-flex justify-content-between align-items-center">
                        <ul
                          className="nav nav-pills"
                          id="pills-tab"
                          role="tablist"
                        >
                          <li className="nav-item" role="presentation">
                            <a
                              className="nav-link active"
                              id="all-orders-tab"
                              data-bs-toggle="pill"
                              href="#all-orders"
                              role="tab"
                              aria-controls="all-orders"
                              aria-selected="true"
                            >
                              Tất cả đơn hàng
                            </a>
                          </li>
                          <li className="nav-item" role="presentation">
                            <a
                              className="nav-link"
                              id="pending-orders-tab"
                              data-bs-toggle="pill"
                              href="#pending-orders"
                              role="tab"
                              aria-controls="pending-orders"
                              aria-selected="false"
                            >
                              Đơn hàng đang chờ xác nhận
                            </a>
                          </li>
                        </ul>
                      </div>

                      <div className="tab-content" id="pills-tabContent">
                        <div
                          className="order__list white-bg table-responsive tab-pane fade show active"
                          id="all-orders"
                          role="tabpanel"
                          aria-labelledby="all-orders-tab"
                        >
                          <table className="table">
                            <thead>
                              <tr>
                                <th scope="col">Order ID</th>
                                <th scope="col">Phone Number</th>
                                <th scope="col">Price</th>
                                <th scope="col">Date</th>
                                <th scope="col">Status</th>
                                <th scope="col">Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderData?.map((item) => (
                                <tr key={item.orderId}>
                                  <td className="order__id">{item.orderId}</td>
                                  <td>
                                    <a
                                      href="product-details.html"
                                      className="order__title"
                                    >
                                      {item.phoneNumber}
                                    </a>
                                  </td>
                                  <td>${item.totalPrice}</td>
                                  <td>
                                    {format(
                                      new Date(item.orderDate),
                                      "dd/MM/yyyy HH:mm"
                                    )}
                                  </td>
                                  <td>
                                    {statusDescriptions[item.orderStatus]}
                                  </td>
                                  <td>
                                    <a
                                      href="product-details.html"
                                      className="order__view-btn"
                                      onClick={(e) => {
                                        e.preventDefault(),
                                          navigator(
                                            `/order-details/${item.orderId}`
                                          );
                                      }}
                                    >
                                      View
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div
                          className="order__list white-bg table-responsive tab-pane fade"
                          id="pending-orders"
                          role="tabpanel"
                          aria-labelledby="pending-orders-tab"
                        >
                          <table className="table">
                            <thead>
                              <tr>
                                <th scope="col">Order ID</th>
                                <th scope="col">Phone Number</th>
                                <th scope="col">Price</th>
                                <th scope="col">Date</th>
                                <th scope="col">Status</th>
                                <th scope="col">Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderData
                                ?.filter(
                                  (item) => item.orderStatus === "PENDING"
                                )
                                .map((item) => (
                                  <tr key={item.orderId}>
                                    <td className="order__id">
                                      {item.orderId}
                                    </td>
                                    <td>
                                      <a
                                        href="product-details.html"
                                        className="order__title"
                                      >
                                        {item.phoneNumber}
                                      </a>
                                    </td>
                                    <td>${item.totalPrice}</td>
                                    <td>
                                      {format(
                                        new Date(item.orderDate),
                                        "dd/MM/yyyy HH:mm"
                                      )}
                                    </td>
                                    <td>
                                      {statusDescriptions[item.orderStatus]}
                                    </td>
                                    <td>
                                      <a
                                        href="product-details.html"
                                        className="order__view-btn"
                                        onClick={(e) => {
                                          e.preventDefault(),
                                            navigator(
                                              `/order-details/${item.orderId}`
                                            );
                                        }}
                                      >
                                        View
                                      </a>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="tab-pane fade"
                    id="nav-password"
                    role="tabpanel"
                    aria-labelledby="nav-password-tab"
                  >
                    <div className="password__change">
                      <div className="password__change-top">
                        <h3 className="password__change-title">
                          Change Password
                        </h3>
                      </div>
                      <div className="password__form white-bg">
                        <form
                          action="#"
                          onSubmit={handleSubmit(onSubmitChangePass)}
                        >
                          <div className="password__input">
                            <p>Old Password</p>
                            {errors.oldPassword && (
                              <div style={{ color: "red" }}>
                                {errors.oldPassword.message}
                              </div>
                            )}
                            <input
                              type="text"
                              placeholder="Enter Old Password"
                              {...register(
                                "oldPassword",
                                changePasswordOptions.oldPassword
                              )}
                            ></input>
                          </div>
                          <div className="password__input">
                            <p>New Password</p>
                            {errors.newPassword && (
                              <div style={{ color: "red" }}>
                                {errors.newPassword.message}
                              </div>
                            )}
                            <input
                              type="text"
                              placeholder="Enter New Password"
                              {...register(
                                "newPassword",
                                changePasswordOptions.newPassword
                              )}
                            ></input>
                          </div>
                          <div className="password__input">
                            <p>Confirm Password</p>
                            {errors.confirmPassword && (
                              <div style={{ color: "red" }}>
                                {errors.confirmPassword.message}
                              </div>
                            )}
                            <input
                              type="text"
                              placeholder="Confirm Password"
                              {...register(
                                "confirmPassword",
                                changePasswordOptions.confirmPassword
                              )}
                            ></input>
                          </div>
                          <div className="password__input">
                            <button
                              type="submit"
                              className="os-btn os-btn-black"
                            >
                              Update password
                            </button>
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
      </section>

      <div className="profile__edit-modal">
        <div
          className="modal fade"
          id="profile_edit_modal"
          aria-labelledby="profile_edit_modal"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="profile__edit-wrapper">
                <div className="profile__edit-close">
                  <button
                    type="button"
                    className="profile__edit-close-btn"
                    data-dismiss="modal"
                  >
                    <i className="fa fa-times"></i>
                  </button>
                </div>
                <form
                  action="#"
                  onSubmit={handleSubmit(onSubmitChangeInfo)}
                  className="row"
                >
                  <div className="col-6">
                    <div className="profile__edit-input">
                      <p>User Name</p>
                      {errors.userName && (
                        <div style={{ color: "red" }}>
                          {errors.userName.message}
                        </div>
                      )}
                      <input
                        type="text"
                        placeholder="Your User Name"
                        {...register("userName", changeInfoOptions.userName)}
                      ></input>
                    </div>

                    <div className="profile__edit-input">
                      <p>Phone</p>
                      {errors.phone && (
                        <div style={{ color: "red" }}>
                          {errors.phone.message}
                        </div>
                      )}
                      <input
                        type="text"
                        placeholder="Your Phone"
                        {...register("phone", changePasswordOptions.phone)}
                      ></input>
                    </div>
                  </div>
                  <div className="col-6 d-flex flex-column justify-content-between">
                    <div>
                      <input
                        type="file"
                        onChange={handleImageChange}
                        {...register(
                          "imgUrlDisplay",
                          changeInfoOptions.imgUrlDisplay
                        )}
                      ></input>

                      {image && (
                        <div style={{ marginTop: "20px" }}>
                          <img
                            src={image}
                            alt="Preview"
                            style={{
                              width: "120px",
                              height: "auto",
                              borderRadius: "8px",
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="profile__edit-input">
                      <button
                        type="submit"
                        className="os-btn os-btn-black w-100"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
