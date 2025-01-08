import express from "express";
import "dotenv/config.js";
import bcrypt from "bcrypt";
import { checkPasswordChange } from "./middleware/checkPasswordChange.js";
import jwt from "jsonwebtoken";
import { authenticateJWT } from "./middleware/auth.js";

const app = express();
const port = process.env.PORT || 3001;
const users = [];
const JWT_SECRET = process.env.JWT_SECRET;

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
      id: users.length + 1,
      email,
      password: hashedPassword,
      role: email === "cat@ukr.net" ? "admin" : "user",
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

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      res.json({ message: `Добро пожаловать, ${user.email}`, user, token });
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
app.post("/delete-account", authenticateJWT, async (req, res) => {
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
app.post("/change-email", authenticateJWT, async (req, res) => {
  const { email, password, newEmail } = req.body;

  if (!email || !password || !newEmail)
    return res.status(400).json({ message: "Все поля обязательны" });

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(404).json({ message: "Пользователь не найден" });

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword)
    return res.status(401).json({ message: "Неверный пароль" });

  if (users.some((u) => u.email === newEmail))
    return res.status(409).json({ message: "Email уже используется" });

  user.email = newEmail;
  res.json({ message: "Email изменен", user });
});

// Назначение администратора
app.post("/update-role", authenticateJWT, async (req, res) => {
  const { id, newRole } = req.body;
  const role = req.user.role;

  if (!id || !newRole)
    return res.status(400).json({ message: "Отсутствует id или newrole" });

  if (role !== "admin") {
    return res.status(403).json({ message: "В доступе отказано" });
  }

  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ message: "Пользователь не найден" });
  const oldRole = user.role;

  if (oldRole === newRole) {
    res.status(400).json({ message: "Пользователь уже имеет данную роль" });
  }
  user.role = newRole;
  res.json({ message: "Пользователь сменил роль", user, oldRole, newRole });
});

// Доступ администратора
app.get("/admin", (req, res) => {
  const { email } = req.body;
  const user = users.find((u) => u.email === email);

  if (!user || user.role !== "admin")
    return res.status(403).json({ message: "Доступ запрещен" });

  res.json({ message: "Добро пожаловать в админ-панель", user });
});
app.post("/refresh-token", authenticateJWT, (req, res) => {
  const authHeader = req.headers.authorization;
  const oldToken = authHeader && authHeader.split(" ")[1];
  if (!oldToken) {
    res.status(401).json({ message: "Unauthorized: Token not provided" });
  }
  const newToken = jwt.sign(
    {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
  res.json({ message: "Токен успешно обновлен", oldToken, newToken });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту: ${port}`);
});
