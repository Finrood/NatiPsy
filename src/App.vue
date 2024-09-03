<template>
  <div class="bg-bg-white min-h-screen">
    <HeroSection id="hero" />
    <JobDescriptionComponent id="jobDescription" />
    <ServicesInfo id="service" />
    <ContactInfo id="contactInfo" />
    <!-- Other sections -->
  </div>
</template>

<script>
import HeroSection from './components/HeroSection.vue'
import JobDescriptionComponent from "@/components/JobDescription.vue";
import ServicesInfo from "@/components/Service.vue";
import ContactInfo from "@/components/contact.vue";

export default {
  components: {
    ContactInfo,
    ServicesInfo,
    JobDescriptionComponent,
    HeroSection,
    // Other components
  },
  // ...
}
</script>
