import express from "express";
import "dotenv/config.js";
import bcrypt from "bcrypt";
import { checkPasswordChange } from "./middleware/checkPasswordChange.js";

const app = express();
const port = process.env.PORT || 3001;
const users = [];

app.use(express.json());

// Регистрация пользователя
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Введите корректные данные" });

    const userExists = users.find((user) => user.email === email);
    if (userExists)
      return res.status(409).json({ message: "Пользователь уже существует" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      email,
      password: hashedPassword,
      role: "user",
      mustChangePassword: email === "cat@ukr.net",
    };

    users.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: "Пользователь зарегистрирован",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    res.status(500).json({ message: "Ошибка регистрации" });
  }
});

// Логин пользователя
app.post(
  "/login",
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: "Введите корректные данные" });

      const user = users.find((u) => u.email === email);
      if (!user)
        return res.status(404).json({ message: "Пользователь не найден" });

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword)
        return res.status(401).json({ message: "Неверный пароль" });

      // res.json({ message: `Добро пожаловать, ${user.email}`, user });
      req.user = user;
      next();
    } catch (error) {
      console.error("Ошибка входа:", error);
      res.status(500).json({ message: "Ошибка входа" });
    }
  },
  checkPasswordChange,
  (req, res) => {
    res.json({ message: `Добро пожаловать, ${req.user.email}` });
  }
);

// Смена пароля
app.post("/change-password", async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword)
    return res.status(400).json({ message: "Все поля обязательны" });

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(404).json({ message: "Пользователь не найден" });

  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  if (!isValidPassword)
    return res.status(401).json({ message: "Неверный пароль" });

  user.password = await bcrypt.hash(newPassword, 10);
  user.mustChangePassword = false;

  res.json({ message: "Пароль изменен", user });
});

// Удаление аккаунта
app.post("/delete-account", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Введите email и пароль" });

  const userIndex = users.findIndex((u) => u.email === email);
  if (userIndex === -1)
    return res.status(404).json({ message: "Пользователь не найден" });

  const user = users[userIndex];
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword)
    return res.status(401).json({ message: "Неверный пароль" });

  users.splice(userIndex, 1);
  res.json({ message: "Аккаунт удален" });
});

// Изменение email
app.post("/change-email", async (req, res) => {
  const { email, currentPassword, newEmail } = req.body;

  if (!email || !currentPassword || !newEmail)
    return res.status(400).json({ message: "Все поля обязательны" });

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(404).json({ message: "Пользователь не найден" });

  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  if (!isValidPassword)
    return res.status(401).json({ message: "Неверный пароль" });

  if (users.some((u) => u.email === newEmail))
    return res.status(409).json({ message: "Email уже используется" });

  user.email = newEmail;
  res.json({ message: "Email изменен", user });
});

// Назначение администратора
app.post("/make-admin", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email обязателен" });

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(404).json({ message: "Пользователь не найден" });

  user.role = "admin";
  res.json({ message: "Пользователь стал админом", user });
});

// Доступ администратора
app.get("/admin", (req, res) => {
  const { email } = req.body;
  const user = users.find((u) => u.email === email);

  if (!user || user.role !== "admin")
    return res.status(403).json({ message: "Доступ запрещен" });

  res.json({ message: "Добро пожаловать в админ-панель", user });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту: ${port}`);
});
