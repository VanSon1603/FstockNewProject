import { useContext, useEffect, useState } from "react";
import Banner from "../components/user/Banner";
import axios from "axios";
import AuthContext from "../contexts/AuthContext";
import { getInfo } from "../service/UserService";
import { ToastContext } from "../contexts/ToastContext";
import { CartContext } from "../contexts/CartContext";
import { useForm } from "react-hook-form";
import { createOrder, createPaymentVnpay } from "../service/OrderService";
import { useNavigate } from "react-router-dom";

const CheckOutPage = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useContext(ToastContext);
  const { cartData } = useContext(CartContext);
  const navigator = useNavigate();
  const [address, setAddress] = useState({
    province: [],
    district: [],
    ward: [],
  });
  const [provinceSelected, setProvinceSelected] = useState();
  const [districtSelected, setDistrictSelected] = useState();
  const [wardSelected, setWardSelected] = useState();
  const [shipingCost, setShippingCost] = useState(0);
  const [userData, setUserData] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [verified, setVerified] = useState(false);
  const [orderData, setOrderData] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({});

  const orderOptions = {
    specificAddress: {
      required: "Address must not be blank",
      maxLength: {
        value: 60,
        message: "Address must be at most 30 characters",
      },
    },
    recipientName: {
      required: "Recipient must not be blank",
      minLength: {
        value: 8,
        message: "Recipient must be at least 8 characters",
      },
      maxLength: {
        value: 30,
        message: "Recipient must be at most 30 characters",
      },
    },

    paymentMethod: {
      required: "Payment method must not be blank",
    },
    orderNotes: {
      required: "Note must not be blank",
    },
    phone: {
      required: "Phone number must not be blank",
    }
  };

  const createOrderId = (len) => {
    const chars = "0123456789";
    let result = "";
    for (let i = 0; i < len; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars.charAt(randomIndex);
    }
    return result;
  };

  const handlePlaceOrder = (formData) => {
    const data = {
      orderId: "",
      recipientName: formData.recipientName,
      note: formData.orderNotes,
      phoneNumber:formData.phone,
      email: userData.email,
      specificAddress: formData.specificAddress,
      provinceName: provinceSelected.ProvinceName,
      districtName: districtSelected.DistrictName,
      wardName: wardSelected.WardName,
      totalPrice: orderTotal,
      orderItems: cartData.map((item) => ({
        productId: item.product.productId,
        quantity: item.quantity,
        priceAtOrder: item.currentPrice,
      })),
      paymentMethod: formData.paymentMethod,
      orderStatus: "PENDING",
    };
    setOrderData(data);
    setVerified(!verified);
    console.log(data);
  };

  const handleCreateOrder = async ( orderData) => {
    try {
      if (orderData.paymentMethod !== "DIRECT_PAYMENT") {
        const orderId = createOrderId(8); 
      
        const resOrder = await createOrder(orderData, orderId);
        if (resOrder.status === 200) {
          
          const resPayment = await createPaymentVnpay(
            Number(orderData.totalPrice),
            orderId
          );
          if (resPayment.status === 200) {
            window.location.href = resPayment.data.data; 
          } else {
            throw new Error("Failed to create payment");
          }
        } else {
          throw new Error("Failed to create order");
        }
      } else {
        const res = await createOrder(orderData, createOrderId(8));
        if (res.status === 200) {
          toast.success(res.data.message);
          navigator("/checkout/success");
        }
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const responseProvince = await axios.get(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/province",
        {
          headers: {
            "Content-Type": "application/json",
            "Token ": "e1ac5c51-2055-11f0-a428-36b09a8cf663",
          },
        }
      );
      setAddress({ province: responseProvince.data.data });
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!provinceSelected) return;
    const fetchData = async () => {
      const responseDistrict = await axios.get(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/district",
        {
          headers: {
            "Content-Type": "application/json",
            "Token ": "e1ac5c51-2055-11f0-a428-36b09a8cf663",
          },
          params: {
            province_id: provinceSelected.ProvinceID,
          },
        }
      );
      setAddress({
        ...address,
        district: responseDistrict.data.data,
      });
    };
    fetchData();
  }, [provinceSelected]);

  useEffect(() => {
    if (!districtSelected) return;
    const fetchData = async () => {
      const responseWard = await axios.get(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward",
        {
          headers: {
            "Content-Type": "application/json",
            "Token ": "e1ac5c51-2055-11f0-a428-36b09a8cf663",
          },
          params: {
            district_id: districtSelected.DistrictID,
          },
        }
      );
      setAddress({ ...address, ward: responseWard.data.data });
    };
    fetchData();
  }, [districtSelected]);

  useEffect(() => {
    if (!wardSelected) return;
    const fetchData = async () => {
      const responseShippingCost = await axios.get(
        "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
        {
          headers: {
            "Content-Type": "application/json",
            "Token ": "e1ac5c51-2055-11f0-a428-36b09a8cf663",
            Shop_id: 5747662,
          },
          params: {
            service_id: 53321,
            insurance_value: subTotal * 25000,
            coupon: null,
            from_district_id: 1482,
            to_district_id: districtSelected.DistrictID,
            to_ward_code: String(wardSelected.WardCode),
            height: 15,
            length: 15,
            weight: 1000,
            width: 15,
          },
        }
      );
      setShippingCost(
        (responseShippingCost.data.data.total / 25000).toFixed(2)
      );
    };
    fetchData();
  }, [wardSelected]);

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
    if (cartData) {
      let totalPriceAll = 0;
      for (let i = 0; i < cartData.length; i++) {
        const item = cartData[i];
        const totalPrice = item.currentPrice * item.quantity;
        totalPriceAll += totalPrice;
      }
      setSubTotal(totalPriceAll.toFixed(2));
    }
  }, [cartData]);

  useEffect(() => {
    if (subTotal == 0 && shipingCost == 0) return;
    setOrderTotal((Number(subTotal) + Number(shipingCost)).toFixed(2));
  }, [shipingCost, subTotal]);

  return (
    <>
      <Banner pageName={"Check Out"}></Banner>
      {!verified ? (
        <section className="checkout-area pb-70 mt-30">
          <div className="container">
            <form action="#" onSubmit={handleSubmit(handlePlaceOrder)}>
              <div className="row">
                <div className="col-lg-6">
                  <div className="checkbox-form">
                    <h3>Billing Details</h3>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="country-select ">
                          <label>
                            Province/City <span className="required">*</span>
                          </label>
                          <select
                            onChange={(e) => {
                              const selectId = Number(e.target.value);
                              const selelectedProvince = address.province.find(
                                (item) => item.ProvinceID === selectId
                              );
                              setProvinceSelected(selelectedProvince);
                            }}
                          >
                            {address.province?.map((item) => (
                              <option
                                key={item.ProvinceID}
                                value={item.ProvinceID}
                              >
                                {item.ProvinceName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="country-select ">
                          <label>
                            District <span className="required">*</span>
                          </label>
                          <select
                            onChange={(e) => {
                              const selectId = Number(e.target.value);
                              const selectedDistrict = address.district.find(
                                (item) => item.DistrictID === selectId
                              );
                              setDistrictSelected(selectedDistrict);
                            }}
                          >
                            {address.district?.map((item) => (
                              <option
                                key={item.DistrictID}
                                value={item.DistrictID}
                              >
                                {item.DistrictName}
                              </option>
                            ))}
                          </select>{" "}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="country-select ">
                          <label>
                            Ward <span className="required">*</span>
                          </label>
                          <select
                            onChange={(e) => {
                              const selectId = String(e.target.value);
                              const selectedWard = address.ward.find(
                                (item) => item.WardCode === selectId
                              );
                              setWardSelected(selectedWard);
                            }}
                          >
                            {address.ward?.map((item) => (
                              <option key={item.WardCode} value={item.WardCode}>
                                {item.WardName}
                              </option>
                            ))}
                          </select>{" "}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="checkout-form-list">
                          <label>
                            First Name <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder=""
                            readOnly
                            value={userData.firstName}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="checkout-form-list">
                          <label>
                            Last Name <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder=""
                            readOnly
                            value={userData.lastName}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="checkout-form-list">
                          <label>Recipient name</label>
                          <input
                            type="text"
                            placeholder=""
                            {...register(
                              "recipientName",
                              orderOptions.recipientName
                            )}
                          />
                        </div>
                      </div>

                      <div className="col-md-12">
                        <div className="checkout-form-list">
                          <label>Specific Address</label>
                          <input
                            type="text"
                            placeholder="Apartment, suite, unit etc. (optional)"
                            {...register(
                              "specificAddress",
                              orderOptions.specificAddress
                            )}
                          />
                          {errors.specificAddress && (
                            <div style={{ color: "red" }}>
                              {errors.specificAddress.message}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-md-12">
                        <div className="checkout-form-list">
                          <label>
                            Email Address <span className="required">*</span>
                          </label>
                          <input
                            type="email"
                            placeholder=""
                            readOnly
                            value={userData.email}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="checkout-form-list">
                          <label>
                            Phone <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Phone number"
                            {...register("phone", orderOptions.phone)}
                            />
                        </div>
                      </div>
                    </div>
                    <div className="order-notes">
                      <div className="checkout-form-list">
                        <label>Order Notes</label>
                        <textarea
                          id="checkout-mess"
                          cols="30"
                          rows="10"
                          placeholder="Notes about your order, e.g. special notes for delivery."
                          {...register("orderNotes", orderOptions.orderNotes)}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="your-order mb-30 ">
                    <h3>Your Item</h3>
                    <div className="your-order-table table-responsive">
                      <table>
                        <thead>
                          <tr>
                            <th className="product-name">Product</th>
                            <th className="product-total">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartData?.map((item, index) => (
                            <tr className="cart_item" key={index}>
                              <td className="product-name">
                                {item.product.productName}{" "}
                                <strong className="product-quantity">
                                  {" "}
                                  × {item.quantity}
                                </strong>
                              </td>
                              <td className="product-total">
                                <span className="amount">
                                  ${item.currentPrice}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="cart-subtotal">
                            <th>Cart Subtotal</th>
                            <td>
                              <span className="amount">{subTotal}</span>
                            </td>
                          </tr>
                          <tr className="shipping">
                            <th>Shipping Cost</th>
                            <td>
                              <span className="amount">${shipingCost}</span>
                            </td>
                          </tr>
                          <tr className="order-total">
                            <th>Order Total</th>
                            <td>
                              <strong>
                                <span className="amount">{orderTotal}</span>
                              </strong>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="payment-method">
                      <tr className="shipping">
                        <th className="mr-3">Shipping </th>
                        <td>
                          <div>
                            <ul>
                              <li>
                                <input
                                  name="shipping"
                                  type="radio"
                                  value="DIRECT_PAYMENT"
                                  {...register(
                                    "paymentMethod",
                                    orderOptions.paymentMethod
                                  )}
                                />
                                <label>Direct Payment</label>
                              </li>
                              <li>
                                <input
                                  name="shipping"
                                  type="radio"
                                  value="VNPAY"
                                  {...register(
                                    "paymentMethod",
                                    orderOptions.paymentMethod
                                  )}
                                />
                                <label>VN Pay</label>
                              </li>
                              <li></li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    </div>
                    <div className="order-button-payment mt-20">
                      <button type="submit" className="os-btn os-btn-black">
                        Place order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>
      ) : (
        <div className="your-order mb-30 row">
          <h3>Your Order</h3>
          <div className="col-lg-6">
            <div className="your-order-table table-responsive">
              <table>
                <tfoot>
                  <tr>
                    <th>Recipient Name</th>
                    <td>
                      <span className="amount">{orderData.recipientName}</span>
                    </td>
                  </tr>
                  <tr>
                    <th>Phone </th>
                    <td>
                      <span className="amount">{orderData.phoneNumber}</span>
                    </td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>
                      <span className="amount">{orderData.email}</span>
                    </td>
                  </tr>
                  <tr>
                    <th>Address</th>
                    <td>
                      <span className="amount">
                        {orderData.provinceName}/{orderData.districtName}/
                        {orderData.wardName}/{orderData.specificAddress}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>Note</th>
                    <td>
                      <span className="amount">{orderData.note}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="your-order-table table-responsive">
              <table>
                <thead>
                  <tr>
                    <th className="product-name">Product</th>
                    <th className="product-total">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {cartData?.map((item, index) => (
                    <tr className="cart_item" key={index}>
                      <td className="product-name">
                        {item.product.productName}{" "}
                        <strong className="product-quantity">
                          {" "}
                          × {item.quantity}
                        </strong>
                      </td>
                      <td className="product-total">
                        <span className="amount">${item.currentPrice}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="cart-subtotal">
                    <th>Cart Subtotal</th>
                    <td>
                      <span className="amount">{subTotal}</span>
                    </td>
                  </tr>
                  <tr className="shipping">
                    <th>Shipping Cost</th>
                    <td>
                      <span className="amount">${shipingCost}</span>
                    </td>
                  </tr>
                  <tr className="order-total">
                    <th>Order Total</th>
                    <td>
                      <strong>
                        <span className="amount">{orderTotal}</span>
                      </strong>
                    </td>
                  </tr>
                  <tr className="shipping">
                    <th>Payment Method</th>
                    <td>
                      <strong>
                        <span className="amount">
                          {orderData.paymentMethod}
                        </span>
                      </strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="order-button-payment mt-20">
              <button
                type=""
                className="os-btn os-btn-black"
                onClick={() => handleCreateOrder(orderData)}
              >
                Order Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default CheckOutPage;
