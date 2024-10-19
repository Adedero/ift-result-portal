const studentRoutes = [
  {
    path: "",
    name: "student-results",
    component: () => import("@/views/student/ResultsView.vue"),
  },
  {
    path: "course-registration",
    name: "course-registration",
    component: () => import("@/views/student/CourseRegistrationView.vue"),
  },
  {
    path: "register-courses",
    name: "register-courses",
    component: () => import("@/views/student/RegisterCoursesView.vue"),
  },
  {
    path: "profile",
    name: "student-profile",
    component: () => import("@/views/student/ProfileView.vue"),
  },
  {
    path: "biometrics",
    name: "student-biometrics",
    component: () => import("@/views/student/BiometricsView.vue")
  },
  {
    path: "result/:resultId",
    name: "student-result",
    component: () => import("@/views/general/ResultView.vue"),
    meta: {
      userRole: "student"
    }
  }
]

export default studentRoutes;