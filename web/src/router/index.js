import { createRouter, createWebHistory } from 'vue-router';

export const constantRoutes = [
  {
    path: '/',
    component: () => import(/* webpackChunkName: "home" */ '../components/common/Home.vue'),
    meta: { title: '自述文件' },
    children: [
      {
        path: '/',
        component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/LimitUpList.vue'),
      },
      {
        path: '/LimitUpList',
        name: 'LimitUpList',
        component: () => import('../components/page/LimitUpList.vue'),
      },
      {
        path: '/LimitUpLadder',
        name: 'LimitUpLadder',
        component: () => import('../components/page/LimitUpLadder.vue'),
      },
      {
        path: '/HotPlates',
        name: 'HotPlates',
        component: () => import('../components/page/HotPlates.vue'),
      },
      {
        path: '/InvestmentCalendar',
        name: 'InvestmentCalendar',
        component: () => import('../components/page/InvestmentCalendar.vue'),
      },
      // 在现有路由配置中添加
      {
        path: '/HotBlockList',
        name: 'HotBlockList',
        component: () => import('../components/page/HotBlockList.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes
});

export default router;