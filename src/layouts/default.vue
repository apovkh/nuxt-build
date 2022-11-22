<script setup lang="ts">
//
</script>

<template>
  <div class="l-wrapper">
    <header class="l-header">
      Header
    </header>

    <main class="l-main">
      <slot />
    </main>

    <footer class="l-footer">
      Footer
    </footer>
  </div>
</template>

<style lang="scss">
  .l-wrapper {
    @apply
      grid
      grid-cols-[100%]
      min-h-[100vh]
    ;

    grid-template-rows: auto 1fr auto;
  }
</style>