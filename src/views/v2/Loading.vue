<template>
  <div class="loading" @click="$router.push({path: '/v2/index'})">返回</div>
</template>

<script>
export default {
  data() {
    return {};
  },
  mounted() {
    localStorage.clear();
  }
};
</script>

<style lang="scss" scoped>
.loading {
  text-align: center;
  img {
    width: 200px;
    height: 200px;
    margin: 50% auto 0 auto;
  }
}
</style>
