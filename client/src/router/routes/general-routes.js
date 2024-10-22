const generalRoutes = [
  {
    path: "",
    name: "login",
    component: () => import("@/views/general/LoginView.vue")
  },
  {
    path: "register",
    name: "register",
    component: () => import("@/views/general/RegisterView.vue")
  },
  {
    path: "forgot-password",
    name: "forgot-password",
    component: () => import("@/views/general/ForgotPasswordView.vue")
  },
  {
    path: "password-reset/:userId",
    name: "password-reset",
    component: () => import("@/views/general/PasswordResetView.vue")
  },
  {
    path: "email-setup/:userId",
    name: "email-setup",
    component: () => import("@/views/general/EmailSetupView.vue")
  }
]

export default generalRoutes;