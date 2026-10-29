import { useContext, useEffect, useState } from "react";
import Banner from "../components/user/Banner";
import { updateCart } from "../service/CartService";
import AuthContext from "../contexts/AuthContext";
import { ToastContext } from "../contexts/ToastContext";
import { CartContext } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
    const {user} = useContext(AuthContext);
    const { toast } = useContext(ToastContext);
    const {cartData , setCartData} = useContext(CartContext);
    const navigator = useNavigate();
    const [updatedCart, setUpdatedCart] = useState(false);
    const [total, setTotal] = useState();

    useEffect( () => {
        if(cartData) {
            let totalPriceAll = 0;
            for (let i = 0; i < cartData.length; i++) {
                const item = cartData[i];
                const totalPrice = item.currentPrice * item.quantity;
                totalPriceAll += totalPrice;
            }
            setTotal(totalPriceAll.toFixed(2));  
        }
    }, [cartData])

    const handleDecQuantity = (e, index) => {
        e.preventDefault();
        const newCartData = [...cartData];
        const currentItem = newCartData[index];
        if(currentItem.quantity > 1) {
            currentItem.quantity -= 1;
        } else {
            newCartData.splice(index, 1);
        }
        setCartData(newCartData);
    }
    const handleIncQuantity = (e, index) => {
        e.preventDefault();
        const newCartData = [...cartData];
        const currentItem = newCartData[index];
        currentItem.quantity += 1;
        setCartData(newCartData);
    }

    const handleRemoveItem = (e, index) => {
        e.preventDefault();
        const newCartData = [...cartData];
        newCartData.splice(index, 1);
        setCartData(newCartData);
    }

    const handleUpdateCart = async (e) => {
        e.preventDefault();
        const datas = [];
        cartData.forEach((item) => {
            const data = {
                cartId: item.cartId,
                quantity: item.quantity,
                productId: item.product.productId,
                email : user.sub
            }
            datas.push(data);
        })
        await updateCart(datas);
        setUpdatedCart(!updatedCart);
        toast.success("Update cart successfully");
    }

    const handlePay = (e) => {
        e.preventDefault();
        if (user.scope?.role == "ROLE_ADMIN") {
            toast.error("Admin cannot make purchases");
            return;
        }
        if ( !cartData ||cartData.length === 0) {
            toast.error("Your cart is empty");
            return;
        }
        navigator("/checkout")
    }
    console.log("cartData: ", cartData);
    
    return (
        <>
            <Banner pageName={"Your Cart"}></Banner>
            <section className="cart-area pt-100 pb-100">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <form action="#">
                            <div className="table-content table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th className="product-thumbnail">Images</th>
                                            <th className="cart-product-name">Product</th>
                                            <th className="product-price">Unit Price</th>
                                            <th className="product-price">Size</th>
                                            <th className="product-price">Color</th>
                                            <th className="product-quantity">Quantity</th>
                                            <th className="product-subtotal">Total</th>
                                            <th className="product-remove">Remove</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {cartData && cartData.map((item, index) => (
                                        <tr key={index}>
                                            <td className="product-thumbnail"><a href="product-details.html"><img
                                            src={item.product.imageUrlDisplay}
                                            alt="Product Image">                                        
                                            </img>
                                          </a></td>
                                            <td className="product-name"><a href="product-details.html">{item.product.productName}</a></td>
                                            
                                            <td className="product-price"><span className="amount">$ {item.currentPrice}</span></td>
                                            <td className="product-price"><span className="amount"> {item.colorName}</span></td>
                                            <td className="product-price"><span className="amount"> {item.sizeName}</span></td>

                                            <td className="product-quantity">
                                                <div className="cart-plus-minus">
                                                    <button className="dec qtybutton" onClick={(e) => handleDecQuantity(e , index)} >-</button>
                                                        <input type="text" value= {item.quantity} />
                                                    <button className="inc qtybutton " onClick={(e) => handleIncQuantity(e, index)}>+</button>
                                                </div>
                                            </td>
                                            <td className="product-subtotal"><span className="amount">{total}</span></td>
                                            <td className="product-remove"><a href="#" onClick={(e)=> handleRemoveItem(e , index)}><i className="fa fa-times"></i></a></td>
                                        </tr>
                                    ))}
                                           
                                    </tbody>
                                </table>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <div className="coupon-all">
                                        <div className="coupon2">
                                            <button className="os-btn os-btn-black" name="update_cart" type="submit" onClick={(e)=> handleUpdateCart(e)}>Update cart</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-5 ml-auto">
                                    <div className="cart-page-total">
                                        <h2>Cart totals</h2>

                                        <ul className="mb-20">
                                            <li>Total <span>{total}</span></li>
                                        </ul>
                                        <a className="os-btn" onClick={(e) => handlePay(e)}>Pay</a>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
        </>
        
       
    );
}
export default CartPage;