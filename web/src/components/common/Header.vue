<template>
    <div class="header">
        <!-- 折叠按钮 -->
        <div class="collapse-btn" @click="handleCollapse">
            <i v-if="!collapse"><el-icon size="24px"><Fold /></el-icon></i>
            <i v-else><el-icon size="24px"><Expand /></el-icon></i>
        </div>
        <div class="logo">每日情绪</div>
        <div class="spacer"></div>
        <div class="header-right">
            
        </div>
    </div>
</template>
<script>
import { ref, computed, onMounted,onUnmounted } from 'vue';
import { Expand, Fold } from '@element-plus/icons-vue';
import emitter from "./bus";

export default {
    name: 'Header',
    components: {
        Expand,
        Fold
    },
    setup() {
        const collapse = ref(false);
        const name = ref('linxin');

        const username = computed(() => {
            const storedUsername = localStorage.getItem('ms_username');
            return storedUsername ? storedUsername : name.value;
        });
        const handleCollapse = () => {
            collapse.value = !collapse.value;
            emitter.emit("collapsed", collapse.value);
        };
        return {
            collapse,
            username,
            handleCollapse
        };
    }
};
</script>

<style scoped>
.header {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 70px;
    font-size: 22px;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.collapse-btn {
    padding: 0px 21px;
    height: 24px;
    margin-top: 29px;
    margin-bottom: 29px;
}

.logo {
    width: 250px;
    display: flex;
    align-items: center;
    height: 100%;
}
.spacer {
  flex-grow: 1;
}
.header-right {
    padding-right: 50px;
    display: flex;
    align-items: center;
    height: 100%;
}

.header-user-con {
    display: flex;
    align-items: center;
    height: 100%;
}

.user-name {
    margin-left: 10px;
}

.user-avator {
    margin-left: 20px;
    display: flex;
    align-items: center;
}

.user-avator img {
    display: block;
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.el-dropdown-link {
    cursor: pointer;
    color: #fff;
}
</style>