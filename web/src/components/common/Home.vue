<template>
  <div class="wrapper">
    <v-head></v-head>
    <v-sidebar></v-sidebar>
    <div class="content-box" :class="{ 'content-collapse': collapse }">
      <div class="content">
        <transition name="move" mode="out-in">
          <keep-alive :include="tagsList">
            <router-view></router-view>
          </keep-alive>
        </transition>
        <el-backtop target=".content"></el-backtop>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import vHead from "./Header.vue";
import vSidebar from "./Sidebar.vue";
import emitter from "./bus"; // 确保你已经创建了这个文件

export default {
  components: {
    vHead,
    vSidebar,
  },
  setup() {
    const tagsList = ref([]);
    const collapse = ref(false); // 明确定义 collapse

    const handleCollapseContent = (msg) => {
      collapse.value = msg;
    };

    onMounted(() => {
      emitter.on("collapsed", handleCollapseContent);
    });

    onUnmounted(() => {
      emitter.off("collapsed", handleCollapseContent);
    });

    return {
      tagsList,
      collapse // 确保返回 collapse，使其在模板中可用
    };
  }
};
</script>