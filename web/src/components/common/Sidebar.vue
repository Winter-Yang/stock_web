<template>
  <div class="sidebar">
    <el-menu
      class="sidebar-el-menu"
      :default-active="onRoutes"
      :collapse="collapse"
      :background-color="'#324157'"
      :text-color="'#bfcbd9'"
      :active-text-color="'#20a0ff'"
      :unique-opened="true"
      mode="vertical"
      router
    >

      <template v-for="item in items" :key="item.index">
        <el-sub-menu v-if="item.subs" :index="item.index">
          <template #title>
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </template>
          <template v-for="subItem in item.subs" :key="subItem.index">
            <el-sub-menu v-if="subItem.subs" :index="subItem.index">
              <template #title>{{ subItem.title }}</template>
              <el-menu-item
                v-for="threeItem in subItem.subs"
                :key="threeItem.index"
                :index="threeItem.index"
              >
                {{ threeItem.title }}
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="subItem.index">
              {{ subItem.title }}
            </el-menu-item>
          </template>
        </el-sub-menu>
        <el-menu-item v-else :index="item.index">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import emitter from "./bus";

import { 
  House, 
  Rank, 
  Document, 
  DocumentCopy 
} from '@element-plus/icons-vue'

export default {
  components: {
    House,
    Rank,
    Document,
    DocumentCopy
  },
  setup() {
    const route = useRoute();
    const collapse = ref(false);
    const items = ref([
      {
        icon: "Money",
        index: "LimitUpLadder",
        title: "涨停梯队",
      },
      {
        icon: "Tickets",
        index: "HotPlates",
        title: "最强题材",
      },
      {
        icon: "Monitor",
        index: "LimitUpList",
        title: "涨停池",
      },
      {
        icon: "Mug",
        index: "InvestmentCalendar",
        title: "投资日历",
      }
      ,{
        icon: "Message",
        index: "BlockRankPage",
        title: "热门板块",
      }
    ]);

    const onRoutes = computed(() => {
      return route.path.replace("/", "");
    });

    const handleCollapse = (msg) => {
      collapse.value = msg;
    };

    onMounted(() => {
      emitter.on("collapsed", handleCollapse);
    });

    return {
      collapse,
      items,
      onRoutes
    };
  }
};
</script>

<style scoped>
.sidebar {
  display: block;
  position: absolute;
  left: 0;
  top: 70px;
  bottom: 0;
  overflow-y: scroll;
}
.sidebar::-webkit-scrollbar {
  width: 0;
}
.sidebar-el-menu:not(.el-menu--collapse) {
  width: 170px;
}
.sidebar > ul {
  height: 100%;
}
</style>