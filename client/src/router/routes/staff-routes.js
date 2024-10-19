const staffRoutes = [
  {
    path: "",
    name: "staff-results",
    component: () => import("@/views/staff/ResultsView.vue"),
  },
  {
    path: "profile",
    name: "staff-profile",
    component: () => import("@/views/staff/ProfileView.vue"),
  },
  {
    path: "biometrics",
    name: "staff-biometrics",
    component: () => import("@/views/staff/BiometricsView.vue")
  },
  {
    path: "result/:resultId",
    name: "staff-result",
    component: () => import("@/views/general/ResultView.vue"),
    meta: {
      userRole: "staff"
    }
  }
]

export default staffRoutes;