
export function checkPasswordChange(req, res, next) {
  const user = req.user;
  if (user && user.mustChangePassword && req.path !== "/change-password") {
    return res.status(403).send("Нужно сменить пароль, перейдите на /change-password");
  }
  next();
}