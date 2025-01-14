// Задание 1
// Создание нового проекта с подключением к MongoDB
// Создайте новый проект Node.js
// Инициализируйте проект командой `npm init -y`, которая создаст файл `package.json` с основными настройками проекта.
// Установите необходимые пакеты:
// Установите необходимые зависимости для проекта: Express для создания сервера, MongoDB Driver для работы с базой данных, и dotenv для использования переменных окружения. Сделайте это с помощью команды `npm install`.
// Создайте структуру проекта:
// Создайте папку `db` для хранения файлов, связанных с базой данных.
// Внутри папки `db` создайте файл `index.js`, который будет отвечать за подключение к MongoDB.
// В корне проекта создайте файл `app.js`, который будет основным файлом вашего приложения.
// Также создайте файл `.env` для хранения конфиденциальной информации, такой как строка подключения к базе данных.
// Настройте подключение к MongoDB:
// В файле `.env` укажите строку подключения к вашей локальной базе данных MongoDB. В файле `db/index.js` реализуйте подключение к базе данных, используя данные из `.env`.
// Настройте приложение Express:
// В файле `app.js` настройте сервер Express и подключение к базе данных, чтобы сервер запускался только при успешном соединении с базой данных.
// Проверьте подключение:
// Запустите приложение через команду `node app.js` и убедитесь, что соединение с базой данных установлено успешно и сервер работает.
// Задание 2

// Создание API для управления другой коллекцией

// Создайте новую коллекцию в MongoDB:

// Используя MongoDB Compass, создайте новую коллекцию в базе данных - коллекцию `products`.

// Определите структуру данных для этой коллекции - поля `name`, `price`, и `description`.

// Создайте API маршруты для управления коллекцией:

// В файле `app.js` создайте маршруты для выполнения CRUD операций с коллекцией `products`.

// Настройте маршрут `POST /products` для создания нового продукта.

// Настройте маршрут `GET /products` для получения списка всех продуктов.

// Настройте маршрут `GET /products/:id` для получения конкретного продукта по ID.

// Настройте маршрут `PUT /products/:id` для обновления информации о продукте.

// Настройте маршрут `DELETE /products/:id` для удаления продукта.

// Используйте MongoDB Driver для взаимодействия с базой данных:

// В каждом из маршрутов реализуйте логику для работы с базой данных, используя MongoDB Driver.

// Убедитесь, что ваши запросы и ответы возвращают корректные данные и статусы.

// Проверьте работоспособность:

// Запустите приложение и с помощью Postman протестируйте все созданные маршруты. Убедитесь, что все операции выполняются корректно.

// Задание 3

// Обработка ошибок

// Реализуйте обработку ошибок с помощью `try-catch`:

// В асинхронных функциях для работы с базой данных используйте блоки `try-catch`, чтобы перехватывать и обрабатывать ошибки.

// В случае ошибки отправьте клиенту ответ с кодом 500 и описанием ошибки.

// Проверьте обработку ошибок:

// Создайте несколько ситуаций, где могут возникнуть ошибки (например, отправка некорректных данных), и убедитесь, что ошибки правильно обрабатываются и клиент получает соответствующие сообщения.

import express from "express";
import { connectToDB, getDB } from "./db/index.js";
import { ObjectId } from "mongodb";

// Создаем приложение Express
const app = express();

// Используем middleware для обработки JSON в теле запроса
app.use(express.json());

// Простой массив для хранения данных (вместо базы данных)
// let products = [
//   {
//     id: 1,
//     name: "Product One",
//     price: 29.99,
//   },
//   {
//     id: 2,
//     name: "Product Two",
//     price: 49.99,
//   },
// ];

// Маршрут для получения всех продуктов (GET /products)
app.get("/products", async (req, res, next) => {
  try {
    const db = getDB();
    const products = await db.collection("products").find().toArray();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// Маршрут для получения конкретного продукта по ID (GET /products/:id)
app.get("/products/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ message: "Id is require" });
    }
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: "Id is not valid" });
    }
    const db = getDB();
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(id) });
    if (!product) {
      res.status(404).json({ message: "Product is not exist" });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Маршрут для создания нового продукта (POST /products)
app.post("/products", async (req, res, next) => {
  try {
    const { title, price } = req.body;
    if (!title || !price) {
      res.status(400).json({ message: "title and price are require" });
    }
    const db = getDB();
    const result = await db.collection("products").insertOne({
      title: title,
      price: price,
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

app.put("/products/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const { title, price } = req.body;
    if (!id) {
      res.status(400).json({ message: "Id is require" });
    }
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: "Id is not valid" });
    }
    const db = getDB();
    const targetProduct = await db
      .collection("products")
      .findOne({ _id: new ObjectId(id) });
    if (!targetProduct) {
      res.status(404).json({ message: "Product is not exist" });
    }
    const updateData = {};
    if (title) {
      updateData.title = title;
    }
    if (price) {
      updateData.price = price;
    }
    const result = await db
      .collection("products")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.delete("/products/:id", async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!id) {
      res.status(400).json({ message: "Id is require" });
    }
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: "Id is not valid" });
    }
    const db = getDB();
    const targetProduct = await db
      .collection("products")
      .findOne({ _id: new ObjectId(id) });
    if (!targetProduct) {
      res.status(404).json({ message: "Product is not exist" });
    }

    const result = await db
      .collection("products")
      .deleteOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error("Error: ", err);
  res.status(500).json({
    message: "Internal server error. Please see the logs for more details",
  });
});

// Запуск сервера на порту 3000
app.listen(3000, async () => {
  try {
    await connectToDB();
    console.log("Server is running on http://localhost:3000");
  } catch (error) {
    console.error("Error: ", err);
  }
});
