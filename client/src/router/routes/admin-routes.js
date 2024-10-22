const adminRoutes = [
  {
    path: "",
    name: "admin-dashboard",
    component: () => import("@/views/admin/DashboardView.vue"),
  },
  {
    path: "results",
    name: "admin-results",
    component: () => import("@/views/admin/ResultsView.vue"),
  },
  {
    path: "result/:resultId",
    name: "admin-result",
    component: () => import("@/views/general/ResultView.vue"),
    meta: {
      userRole: "admin"
    }
  },
  {
    path: "courses",
    name: "admin-courses",
    component: () => import("@/views/admin/CoursesView.vue"),
  },
  {
    path: "administrators",
    name: "admin-admins",
    component: () => import("@/views/admin/AdminsView.vue")
  },
  {
    path: "staffs",
    name: "admin-staffs",
    component: () => import("@/views/admin/StaffsView.vue")
  },
  {
    path: "students",
    name: "admin-students",
    component: () => import("@/views/admin/StudentsView.vue")
  },
  {
    path: "registration-pins",
    name: "admin-pins",
    component: () => import("@/views/admin/PinsView.vue")
  },
  {
    path: "biometrics",
    name: "admin-biometrics",
    component: () => import("@/views/admin/BiometricsView.vue")
  },
  {
    path: "profile",
    name: "admin-profile",
    component: () => import("@/views/admin/ProfileView.vue")
  }
]

export default adminRoutes;