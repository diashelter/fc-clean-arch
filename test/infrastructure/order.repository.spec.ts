import { Sequelize } from "sequelize-typescript";
import Order from "../../src/domain/checkout/entity/order";
import OrderItem from "../../src/domain/checkout/entity/order_item";
import Customer from "../../src/domain/customer/entity/customer";
import Address from "../../src/domain/customer/value-object/address";
import Product from "../../src/domain/product/entity/product";
import CustomerModel from "../../src/infrastructure/customer/repository/sequelize/customer.model";
import CustomerRepository from "../../src/infrastructure/customer/repository/sequelize/customer.repository";
import ProductModel from "../../src/infrastructure/product/repository/sequelize/product.model";
import ProductRepository from "../../src/infrastructure/product/repository/sequelize/product.repository";
import OrderItemModel from "../../src/infrastructure/order/repository/sequilize/order-item.model";
import OrderModel from "../../src/infrastructure/order/repository/sequilize/order.model";
import OrderRepository from "../../src/infrastructure/order/repository/sequilize/order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: ordemItem.id,
          name: ordemItem.name,
          price: ordemItem.price,
          quantity: ordemItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });
});
