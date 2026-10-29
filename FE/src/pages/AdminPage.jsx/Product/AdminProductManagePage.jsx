import { useContext, useEffect, useState } from "react";
import { deleteProduct, getAllProducts } from "../../../service/ProductService";
import Loading from "../../../components/user/Loading";
import Pagination from "../../../components/user/Pagination";
import { ToastContext } from "../../../contexts/ToastContext";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useNavigate } from "react-router-dom";

const AdminProductManagePage = () => {
  const [products, setProducts] = useState([]);
  const [productUpdate, setProductUpdate] = useState(false);
  const [pageInfo, setPageInfo] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const { toast } = useContext(ToastContext);
  const navigator = useNavigate();
  useEffect(() => {
    try {
      const fetchProducts = async () => {
        const response = await getAllProducts(
          currentPage,
          pageSize,
          searchValue
        );
        if (response && response.status === 200) {
          const data = await response.data.content;
          setPageInfo(response.data);
          setProducts(data);
        }
      };
      fetchProducts();
    } catch (errors) {
      toast.error(errors.response.data.message);
    }
  }, [currentPage, pageSize, searchValue, productUpdate]);

  const handleSetCurrentPage = (name, value) => {
    setCurrentPage(value);
  };
  const handleSetPageSize = (e) => {
    setPageSize(e.target.value);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setSearchValue(e.target.value);
    }
  };

  const handleDeleteProduct = (id, e) => {
    e.preventDefault();
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure to do this.",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              const result = await deleteProduct(id);
              if (result && result.status === 200) {
                toast.success("Delete Category successfully");
              }
              setProductUpdate(!productUpdate);
            } catch (error) {
              toast.error(error.response?.data?.message || "Delete failed");
            }
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  if (products.length === 0) {
    return <Loading></Loading>;
  }

  return (
    <div id="app-content">
      <div className="app-content-area">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12 col-md-12 col-12">
              <div className="mb-5">
                <h3 className="mb-0">Products</h3>
              </div>
            </div>
          </div>
          <div>
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header d-md-flex border-bottom-0">
                    <div className="flex-grow-1">
                      <a
                        href="#!"
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.preventDefault();
                          navigator("/admin/product/create-product");
                        }}
                      >
                        + Add Product
                      </a>
                    </div>
                    <div className="mt-3 mt-md-0">
                      <a href="#!" className="btn btn-outline-white ms-2">
                        Import
                      </a>
                      <a href="#!" className="btn btn-outline-white ms-2">
                        Export
                      </a>
                    </div>
                  </div>
                  <div className="card-header border-bottom-0 border-top d-flex flex-row justify-content-between align-items-center">
                    <div className="d-flex flex-column">
                      <label className="form-label">Search</label>
                      <div className="input-group" style={{ width: "100%" }}>
                        <input
                          className="form-control rounded-3 bg-transparent ps-9"
                          type="search"
                          id="searchInput"
                          placeholder="Search"
                          onKeyDown={handleKeyDown}
                        />
                        <button
                          className="btn position-absolute start-0"
                          type="button"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            className="feather feather-search text-dark"
                          >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Show</label>
                      <select
                        className="form-select form-select-sm"
                        onChange={handleSetPageSize}
                      >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="5">5</option>
                      </select>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="table-responsive table-card">
                      <table
                        id="example"
                        className="table text-nowrap table-centered mt-0"
                        style={{ width: 100 + "%" }}
                      >
                        <thead className="table-light">
                          <tr>
                            <th>Product</th>
                            <th>Id</th>
                            <th>Category</th>
                            <th>SKU</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product, index) => {
                            return (
                              <tr key={index}>
                                <td className="">
                                  <div className="d-flex align-items-center">
                                    <img
                                      src={product.imageUrlDisplay}
                                      alt=""
                                      className="img-4by3-sm rounded-3"
                                    />
                                    <div className="ms-3">
                                      <h5 className="mb-0">
                                        <a href="#!" className="text-inherit">
                                          {product.productName}
                                        </a>
                                      </h5>
                                      <span className="text-warning">
                                        <i className="mdi mdi-star"></i>
                                        <i className="mdi mdi-star ms-n1"></i>
                                        <i className="mdi mdi-star ms-n1"></i>
                                        <i className="mdi mdi-star ms-n1"></i>
                                        <i className="mdi mdi-star ms-n1"></i>
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td>{product.productId}</td>
                                <td>{product.category.categoryName}</td>
                                <td>{product.productSKU}</td>
                                <td>{product.priceDefault}</td>
                                <td>{product.quantityInStock}</td>

                                <td>
                                  <a
                                    href="#!"
                                    className="btn btn-ghost btn-icon btn-sm rounded-circle texttooltip"
                                    data-template="eyeOne"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      navigator(
                                        `/admin/product/product-variants/${product.productId}`
                                      );
                                    }}
                                  >
                                    <i className="icon-xs bi bi-eye-fill"></i>
                                    <div id="eyeOne" className="d-none">
                                      <span>View</span>
                                    </div>
                                  </a>
                                  <a
                                    href="#!"
                                    className="btn btn-ghost btn-icon btn-sm rounded-circle texttooltip"
                                    data-template="editOne"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      navigator(
                                        `/admin/product/update-product/${product.productId}`
                                      );
                                    }}
                                  >
                                    <i className="icon-xs bi bi-gear-fill"></i>
                                    <div id="editOne" className="d-none">
                                      <span>Edit</span>
                                    </div>
                                  </a>
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-icon btn-sm rounded-circle texttooltip delete"
                                    data-template="trashOne"
                                    onClick={(e) => {
                                      handleDeleteProduct(product.productId, e);
                                    }}
                                  >
                                    <i className="icon-xs bi bi-trash3-fill"></i>
                                    <div id="trashOne" className="d-none">
                                      <span>Delete</span>
                                    </div>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      <div className="row border-top pt-10">
                        <Pagination
                          totalPage={pageInfo.totalPages}
                          handlePageNumber={handleSetCurrentPage}
                        ></Pagination>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductManagePage;
