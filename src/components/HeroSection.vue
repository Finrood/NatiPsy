<template>
  <section :id="id" class="min-h-screen bg-white text-primary-blue flex flex-col lg:flex-row items-center justify-center p-8 lg:p-16">
    <!-- Left side - Photo -->
    <div class="relative w-full md:w-1/3 lg:w-1/3 mb-8 lg:mb-0 flex justify-center lg:justify-end">
      <div class="absolute inset-0 bg-gradient-to-l from-primary-pink to-primary-pink shadow-lg transform -skew-y-6 sm:skew-y-0 sm:rotate-6 sm:rounded-3xl"></div>
      <div class="relative w-auto h-auto rounded-3xl overflow-hidden shadow-xl z-20">
        <img src="@/assets/img.png" alt="Natalia Ferreira" class="w-auto h-full object-cover" />
      </div>
    </div>

    <!-- Right side - Presentation -->
    <div class="w-full lg:w-2/3 lg:pl-16 flex flex-col items-center lg:items-start">
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-blue mb-4 text-center lg:text-left font-serif">
        Descubra o poder da terapia online!
      </h1>
      <h2 class="text-2xl text-primary-pink-dark md:text-2xl lg:text-3xl mb-6 text-center lg:text-left font-sans">
        Natalia Ferreira | Psicóloga - CRP 12/19892
      </h2>
      <p class="text-2xl mb-8 text-center lg:text-left font-sans">
        Com um olhar sistêmico, ofereço um <span class="font-semibold">espaço seguro</span> e <span class="font-semibold">acolhedor</span> para <span class="font-semibold">jovens, adultos e idosos</span> que buscam equilíbrio, crescimento pessoal e <span class="font-semibold">bem-estar</span>.
      </p>
      <p class="text-2xl mb-8 text-center lg:text-left font-sans">
        Através da terapia online, estou aqui para te ajudar a navegar pelos desafios da vida, desenvolver estratégias eficazes e construir uma ponte entre sua realidade atual e seus objetivos futuros.
      </p>
      <p class="text-2xl mb-8 text-center lg:text-left font-sans">
        Invista em seu <span class="font-semibold">autocuidado</span> e descubra como nosso trabalho conjunto pode transformar sua jornada pessoal.
      </p>
      <p class="text-2xl font-semibold mb-8 text-center lg:text-left font-sans">
        Agende sua consulta e comece sua jornada de transformação hoje mesmo!
      </p>
      <a
          :href="whatsappLink"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex center items-center bg-primary-blue text-white font-bold py-3 px-6 text-xl rounded-full shadow-lg hover:bg-opacity-90 transition duration-300 transform hover:scale-105">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="5 0 48 48"
            fill="currentColor"
            class="w-8 h-8 mr-2">
          <path fill="#fff" d="M4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24	c0,10.5-8.5,19-19,19c0,0,0,0,0,0h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3z"></path>
          <path fill="#fff" d="M4.9,43.8c-0.1,0-0.3-0.1-0.4-0.1c-0.1-0.1-0.2-0.3-0.1-0.5L7,33.5c-1.6-2.9-2.5-6.2-2.5-9.6	C4.5,13.2,13.3,4.5,24,4.5c5.2,0,10.1,2,13.8,5.7c3.7,3.7,5.7,8.6,5.7,13.8c0,10.7-8.7,19.5-19.5,19.5c-3.2,0-6.3-0.8-9.1-2.3	L5,43.8C5,43.8,4.9,43.8,4.9,43.8z"></path>
          <path fill="#cfd8dc" d="M24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3	l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5 M24,43L24,43L24,43 M24,43L24,43L24,43 M24,4L24,4C13,4,4,13,4,24	c0,3.4,0.8,6.7,2.5,9.6L3.9,43c-0.1,0.3,0,0.7,0.3,1c0.2,0.2,0.4,0.3,0.7,0.3c0.1,0,0.2,0,0.3,0l9.7-2.5c2.8,1.5,6,2.2,9.2,2.2	c11,0,20-9,20-20c0-5.3-2.1-10.4-5.8-14.1C34.4,6.1,29.4,4,24,4L24,4z"></path>
          <path fill="#40c351" d="M35.2,12.8c-3-3-6.9-4.6-11.2-4.6C15.3,8.2,8.2,15.3,8.2,24c0,3,0.8,5.9,2.4,8.4L11,33l-1.6,5.8l6-1.6l0.6,0.3	c2.4,1.4,5.2,2.2,8,2.2h0c8.7,0,15.8-7.1,15.8-15.8C39.8,19.8,38.2,15.8,35.2,12.8z"></path>
          <path fill="#fff" fill-rule="evenodd" d="M19.3,16c-0.4-0.8-0.7-0.8-1.1-0.8c-0.3,0-0.6,0-0.9,0s-0.8,0.1-1.3,0.6c-0.4,0.5-1.7,1.6-1.7,4	s1.7,4.6,1.9,4.9s3.3,5.3,8.1,7.2c4,1.6,4.8,1.3,5.7,1.2c0.9-0.1,2.8-1.1,3.2-2.3c0.4-1.1,0.4-2.1,0.3-2.3c-0.1-0.2-0.4-0.3-0.9-0.6	s-2.8-1.4-3.2-1.5c-0.4-0.2-0.8-0.2-1.1,0.2c-0.3,0.5-1.2,1.5-1.5,1.9c-0.3,0.3-0.6,0.4-1,0.1c-0.5-0.2-2-0.7-3.8-2.4	c-1.4-1.3-2.4-2.8-2.6-3.3c-0.3-0.5,0-0.7,0.2-1c0.2-0.2,0.5-0.6,0.7-0.8c0.2-0.3,0.3-0.5,0.5-0.8c0.2-0.3,0.1-0.6,0-0.8	C20.6,19.3,19.7,17,19.3,16z" clip-rule="evenodd"></path>
        </svg>
        Agende Sua Consulta
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
  },
  data() {
    return {
      phoneNumber: '+554884323764',
      message: '',
    };
  },
  computed: {
    whatsappLink() {
      return `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(this.message)}`;
    },
  },
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
