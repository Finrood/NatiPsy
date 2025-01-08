<!-- pages/blog/index.vue -->
<template>
  <HeroSection id="inicio" />
  <ServicesInfo id="meus-servicos" />
  <MyApproachSection id="abordagem" />
  <TherapyAdvantages id="vantagens" />
  <AboutMeSection id="sobre-mim" />
  <BlogOverview id="blog-overview" />
</template>

<script setup>
import ServicesInfo from "~/components/Service.vue";
import TherapyAdvantages from "~/components/Advantages.vue";
import MyApproachSection from "~/components/Approach.vue";
import AboutMeSection from "~/components/AboutMe.vue";
import BlogOverview from "~/components/BlogOverview.vue";
</script>
