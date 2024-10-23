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
    },
    {
      path: '/404',
      name: '404',
      component: () => import('@/views/errors/Error404.vue')
    },
    {
      path: '/403',
      name: '403',
      component: () => import('@/views/errors/Error403.vue')
    },
    {
      path: '/500',
      name: '500',
      component: () => import('@/views/errors/Error500.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      beforeEnter: (to, from, next) => { next('/404') }
    }
  ],
});


router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const userId = to.params.userId;
    if (!userId) {
      next("/")
    }
    const user = JSON.parse(localStorage.getItem(`user-${userId}`));
    if (!user || !user.token || !user.role.toLowerCase() === record.meta.role.toLowerCase()) {
      next("/");
    } else {
      next()
    }
  } else {
    next();
  }
})


export default router;