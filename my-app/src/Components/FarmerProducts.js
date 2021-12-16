import { Form, Image, Card, ListGroup, Table, InputGroup, Button, Col, Container, Modal, Row } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import API from '../API';
import { useState, useEffect } from 'react'
import "./FarmerProducts.css";
import ProductNew from "./AddNewProduct"

function FarmerProducts(props) {
  const [products, setProducts] = useState([]);
  const [updateProducts, setUpdateProducts] = useState(true);
  const [updated, setUpdated] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [productsByFarmer, setProductsByFarmer] = useState(false);
  const [addProdShow, setAddProdShow] = useState(false);
  const [productsByFarmerUpdate, setProductsByFarmerUpdate] = useState(true);

  async function addProdTest(p, prod) {

    try {

      let updatedPrd = {
        "ImageID": p.ImageID,
        "NameProduct": prod.productByFarmerID === false ? p.Name : p.NameProduct,
        "Price": prod.Price,
        "ProdByFarmerID": "",
        "ProductID": prod.ProductID,
        "Quantity": prod.Quantity,
        "UnitOfMeasurement": prod.UnitOfMeasurement,
      }



      let result = await API.addProduct(prod, props.timeMachine().toString());
      if (await !result.hasOwnProperty('productByFarmerID'))
        throw ({ "err": "errore" });

      if (prod.productByFarmerID !== false) { //if the product is EDITED
        let copy = JSON.parse(JSON.stringify(productsByFarmer));
        let index = copy.findIndex(p => p.ProdByFarmerID === prod.productByFarmerID)
        updatedPrd.ProdByFarmerID = await result.productByFarmerID;
        copy[index] = updatedPrd;
        console.log("index" + index);
        setProductsByFarmer(copy);
      }
      else {
        updatedPrd.ProdByFarmerID = await result.productByFarmerID;
        setProductsByFarmer([updatedPrd, ...productsByFarmer]);
      }

      setSelectedProduct([]);

    }
    catch (err) {
      console.log(err);
      //TODO Error message
    }
  }


  async function deleteProductByFarmer(PbFid) {
    try {
      let result = await API.deleteProduct({ productByFarmerID: PbFid })
      if (await result.hasOwnProperty('err')) {
        throw (result.err);
      }

      let newproducts = productsByFarmer.filter(pbf => pbf.ProdByFarmerID !== PbFid);
      console.log(productsByFarmer)
      setProductsByFarmer(newproducts);
      setSelectedProduct([]);

    }
    catch (err) {
      console.log(err);
      //TODO Error message
    }
  }

  useEffect(() => {
    if (updateProducts) {
      API.getAllProducts()
        .then(p => {
          // filter the products that are already present in ProductByFarmer table
          setProducts(p);
          setUpdated(true);
          setUpdateProducts(false);
        }).catch(f => console.log(f));
    }
  }, [updateProducts]);

  useEffect(() => {
    if (productsByFarmerUpdate) {
      API.getProductsByFarmer(props.timeMachine().toString())
        .then(p => {
          setProductsByFarmer(p);
          setProductsByFarmerUpdate(false);
        }).catch(f => {
          setProductsByFarmer([]);
          setProductsByFarmerUpdate(false);
          console.log(f)
        });
    }
  }, [productsByFarmerUpdate]);

  useEffect(() => {
    if (props.reloadTime)
      setProductsByFarmerUpdate(true);
  }, [props.reloadTime])


  if (updated && props.user.Role === "Farmer") return (
    <Container className="search-container">

      <div className="placement-top">
        <h3>This week release</h3>
        <ProductsDropdown products={productsByFarmer.length > 0 ? products.filter(pp => !productsByFarmer.some(pbf => pbf.ProductID === pp.ProductID)) : products} setSelectedProduct={setSelectedProduct} selectedProduct={selectedProduct} />
        <div className="mt-2" style={{ textAlign: "right", marginRight: "-10px" }}>
          <Button className="search-button" disabled={selectedProduct.length > 0 ? false : true} onClick={() => setAddProdShow(true)} variant="secondary">Add</Button>
          <ProductNew UpdateProdList={() => setUpdateProducts(true)} />
        </div>
      </div>

      <Table className="d-flex justify-content-center">
        <tbody id="prod-table" align="center">
          {productsByFarmer !== false ? productsByFarmer.map(p =>
            <ProductCard key={p.ProdByFarmerID} p={p} deleteProductByFarmer={deleteProductByFarmer} addProdTest={addProdTest} />
          ) : ""}
        </tbody>
      </Table>
      <ProductByFarmerModal Edit={false} addProdTest={addProdTest} p={selectedProduct.length > 0 ? selectedProduct[0] : null} show={addProdShow} onHide={() => setAddProdShow(false)} />

    </Container >)
  else return "";

}


function ProductCard(props) {
  const [show, setShow] = useState(false);
  const [showPic, setShowPic] = useState(false);

  let newSrc = "http://localhost:3001/images/" + props.p.ImageID + ".png"


  //TODO: see if we can make the image responsive using className="img-fluid"

  return (
    <>
      <ProductByFarmerModal Edit={true} addProdTest={props.addProdTest} p={props.p} show={show} onHide={() => setShow(false)} />
      <PictureModal src={newSrc} show={showPic} onHide={() => setShowPic(false)} />
      <Card className="client-card mt-3">
        <Card.Body>

          <Row>
            <Col className="mt-1">
              <Card.Title style={{ fontSize: 19, textAlign: 'left', marginLeft: '10px' }} className="mt-1"> {props.p.NameProduct}</Card.Title>
            </Col>
            <Col>
              <div className="mt-2" style={{ textAlign: 'right', marginRight: "15px" }}>
                <Button style={{ "marginRight": "0.3rem" }} variant="outline-danger" size="sm" onClick={() => props.deleteProductByFarmer(props.p.ProdByFarmerID)}>Delete</Button>
                <Button variant="warning" size="sm" onClick={() => setShow(true)}>Edit</Button>
              </div>
            </Col>
          </Row>


          <Row className="mt-3 mb-2">

            <Col>
              <Col>
                <Image onClick={() => setShowPic(true)} src={newSrc} height={"115 px"} rounded />
              </Col>
            </Col>

            <Col>
              <ListGroup style={{ textAlign: "left", marginRight: "15px", fontSize: '13px' }}>
                <ListGroup.Item> Quantity: {props.p.Quantity}</ListGroup.Item>
                <ListGroup.Item> Unit: {props.p.UnitOfMeasurement}</ListGroup.Item>
                <ListGroup.Item> Price: {props.p.Price}€</ListGroup.Item>
              </ListGroup>
            </Col>

          </Row>

        </Card.Body>
      </Card>
    </>
  );
}

function ProductByFarmerModal(props) {


  const [price, setPrice] = useState(props.Edit ? props.p.Price : "");
  const [quantity, setQuantity] = useState(props.Edit ? props.p.Quantity : "");
  const [unit, setUnit] = useState(props.Edit ? props.p.UnitOfMeasurement : "");

  function AddProduct() {
    let prod = {
      productByFarmerID: props.Edit ? props.p.ProdByFarmerID : false,
      UnitOfMeasurement: unit,
      Quantity: parseInt(quantity),
      Price: parseFloat(price),
      ProductID: props.p.ProductID
    }

    props.addProdTest(props.p, prod);
    props.onHide();
    if (!props.Edit) {
      setPrice("");
      setQuantity("");
      setUnit("");
    }

  }




  //TODO VALIDATION
  if (!props.p && !props.Edit)
    return ""
  else
    return (
      <Modal
        show={props.show}
        onHide={props.onHide}
        size="sm"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {props.p.Name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <Form onSubmit={(event) => event.preventDefault()}>
            <Form.Label>Enter the price in the 0.00 format</Form.Label>
            <InputGroup>
              <InputGroup.Text>€</InputGroup.Text>
              <Form.Control value={price} type="number" placeholder="enter a price (e.g: 10.00)" onChange={(event) => { setPrice(event.target.value) }} /><br />
            </InputGroup>

            <Form.Label>Enter the quantity</Form.Label>
            <Form.Control value={quantity} type="number" placeholder="enter a qunatity number" onChange={(event) => { setQuantity(event.target.value) }} /><br />
            <Form.Label>Enter the unit of measurement</Form.Label>
            <Form.Control value={unit} placeholder="enter a unit value (e.g: kg,bag)" onChange={(event) => { setUnit(event.target.value) }} /><br />

          </Form>

        </Modal.Body>
        <Button onClick={AddProduct} variant="success">{!props.Edit ? "Add the product" : "Edit the product"}</Button>

      </Modal>
    );



}


function PictureModal(props) {
  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body>
        <Image className="img-fluid" src={props.src} />
      </Modal.Body>

    </Modal>
  );




}

function ProductsDropdown(props) {




  const filterByFields = ['Name'];
  return (
    <>
      <Form.Group>
        <Typeahead
          filterBy={filterByFields}
          id="basic-typeahead-single"
          labelKey={(option) => `${option.Name}`}
          onChange={props.setSelectedProduct}
          options={props.products}
          placeholder="🍳 Choose a product..."
          selected={props.selectedProduct}
          renderMenuItemChildren={(option) => (
            <div>
              {option.Name}
              <div>
                <small>{option.Description} </small>
              </div>
            </div>
          )}
        />
      </Form.Group>

    </>


  );
};

export default FarmerProducts;
