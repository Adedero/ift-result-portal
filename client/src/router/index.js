import { createWebHistory, createRouter } from "vue-router";
import generalLayout from "../layouts/general-layout.vue";
import generalRoutes from "./routes/general-routes";
import adminRoutes from "./routes/admin-routes";
import staffRoutes from "./routes/staff-routes";
import studentRoutes from "./routes/student-routes";


const router = createRouter({
  history: createWebHistory(),
  routes : [
    {
      path: "/",
      name: "default",
      component: generalLayout,
      children: generalRoutes
    },
    {
      path: "/portal/:userId",
      name: "portal",
      component: () => import("@/layouts/portal-layout.vue"),
      children: [
        {
          path: "admin",
          component: () => import("@/views/admin/AdminLayout.vue"),
          children: adminRoutes,
          meta: {
            role: "ADMIN",
            requiresAuth: true
          }
        },
        {
          path: "staff",
          component: () => import("@/views/staff/StaffLayout.vue"),
          children: staffRoutes,
          meta: {
            role: "STAFF",
            requiresAuth: true
          }
        },
        {
          path: "student",
          component: () => import("@/views/student/StudentLayout.vue"),
          children: studentRoutes,
          meta: {
            role: "STUDENT",
            requiresAuth: true
          }
        }
      ]
    }
  ],
})

export default router;