<template>
  <div class="bg-bg-white min-h-screen">
    <HeroSection id="hero" />
    <JobDescriptionComponent id="jobDescription" />
    <ServicesInfo id="service" />
    <ContactInfo id="contactInfo" />
    <WebsiteFooter></WebsiteFooter>
  </div>
</template>

<script>
import HeroSection from './components/HeroSection.vue'
import JobDescriptionComponent from "@/components/JobDescription.vue";
import ServicesInfo from "@/components/Service.vue";
import ContactInfo from "@/components/contact.vue";
import WebsiteFooter from "@/components/footer.vue";

export default {
  components: {
    WebsiteFooter,
    ContactInfo,
    ServicesInfo,
    JobDescriptionComponent,
    HeroSection,
    // Other components
  },
  // ...
}
</script>
