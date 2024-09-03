<template>
  <section :id="id" class="min-h-screen bg-white text-primary-blue flex flex-col lg:flex-row items-center justify-center p-8 lg:p-16">
    <!-- Left side - Photo -->
    <div class="w-full md:w-1/2 lg:w-1/2 mb-8 lg:mb-0 flex justify-center lg:justify-end">
      <div class="relative w-full h-auto rounded-3xl overflow-hidden shadow-xl">
        <img src="../assets/kaaristote.jpg" alt="Your Name" class="w-full h-full object-cover" />
      </div>
    </div>

    <!-- Right side - Presentation -->
    <div class="w-full lg:w-1/2 lg:pl-16 flex flex-col items-center lg:items-start">
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-blue mb-4 text-center lg:text-left font-serif">
        Your Name
      </h1>
      <h2 class="text-xl text-primary-pink-dark md:text-2xl lg:text-3xl mb-6 text-center lg:text-left font-sans">
        Professional Psychologist
      </h2>
      <p class="text-lg mb-8 text-center lg:text-left font-sans">
        With over 10 years of experience, I'm dedicated to helping individuals overcome challenges and achieve mental well-being. My approach combines evidence-based techniques with compassionate care to provide personalized support for each client.
      </p>
      <a
          :href="`https://wa.me/${whatsappNumber}?text=Hello!`"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center bg-primary-blue text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-opacity-90 transition duration-300 transform hover:scale-105">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            fill="currentColor"
            class="w-5 h-5 mr-2">
          <path d="M16 0c8.837 0 16 7.163 16 16 0 3.535-1.135 6.814-3.074 9.515l-.453.624.671 3.895-.711-3.855-3.954-.671-.611.449A15.917 15.917 0 0116 32C7.163 32 0 24.837 0 16S7.163 0 16 0zm0 1.5C7.977 1.5 1.5 7.977 1.5 16c0 3.41 1.144 6.66 3.246 9.282l.227.295-.669 3.89 3.92-.672.296.227C13.348 29.359 14.67 30 16 30c8.023 0 14.5-6.477 14.5-14.5S24.023 1.5 16 1.5zm-2.938 7.875c.348 0 .781.004 1.145.008.404.005.832-.003 1.278.968.495 1.07 1.675 4.115 1.827 4.403.152.288.253.635.044.964-.209.33-.312.514-.617.786-.304.272-.642.607-.92.97-.279.362-.562.469-.976.199-.414-.27-1.749-1.086-3.211-2.75-.851-.965-1.421-2.163-1.588-2.426-.167-.263-.014-.583.254-.871.269-.288.601-.683.854-1.011.253-.328.506-.343.855-.057.35.286 1.456 1.232 1.854 1.46.399.228.609.195.856-.114.247-.31 1.07-1.258 1.296-1.597.228-.34.114-.556-.057-.797-.171-.24-1.31-3.154-1.798-4.334-.489-1.18-1.023-1.165-1.416-1.178-.393-.013-.844-.02-1.291-.013-.447.007-.88-.015-1.36.663-.481.678-1.834 1.788-1.834 4.366 0 2.578 1.82 5.074 2.077 5.434.258.36 3.93 5.769 9.016 5.769 2.917 0 4.29-1.834 4.585-2.418.295-.585.36-1.193.36-1.315 0-.122-.059-.197-.129-.213z"/>
        </svg>
        Book a Consultation
      </a>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HeroSection',
  props: {
    id: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Raleway:wght@400;700&display=swap');

  .font-serif {
    font-family: 'Playfair Display', serif;
  }

  .font-sans {
    font-family: 'Raleway', sans-serif;
  }
</style>
