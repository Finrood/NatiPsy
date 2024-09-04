<template>
  <div class="bg-bg-white min-h-screen">
    <HeroSection id="hero" />
    <ServicesInfo id="service" />
    <MyApproachSection id="myApproach" />
    <TherapyAdvantages ></TherapyAdvantages>
    <AboutMeSection id="aboutMe" />
    <ContactInfo id="contactInfo" />
    <WebsiteFooter></WebsiteFooter>
  </div>
</template>

<script>
import HeroSection from './components/HeroSection.vue'
import JobDescriptionComponent from "@/components/JobDescription.vue";
import ServicesInfo from "@/components/Service.vue";
import ContactInfo from "@/components/Contact.vue";
import WebsiteFooter from "@/components/Footer.vue";
import MyApproachSection from "@/components/Approach.vue";
import TherapyAdvantages from "@/components/Advantages.vue";
import AboutMeSection from "@/components/AboutMe.vue";

export default {
  components: {
    AboutMeSection,
    TherapyAdvantages,
    MyApproachSection,
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
