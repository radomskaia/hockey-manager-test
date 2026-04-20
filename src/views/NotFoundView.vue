<template>
  <section class="not-found-view">
    <h1>404</h1>
    <p>Page not found.</p>
    <RouterLink to="/"> Back to home </RouterLink>
  </section>
</template>

<style scoped lang="scss">
.not-found-view {
  min-height: 60vh;
  display: grid;
  place-content: center;
  text-align: center;
  gap: 8px;

  h1,
  p {
    margin: 0;
  }
}
</style>
