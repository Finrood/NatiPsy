<template>
  <section class="about-me bg-white py-16 px-4 sm:px-6 lg:px-8" aria-labelledby="about-me-heading">
    <div class="max-w-5xl mx-auto">
      <h1 id="about-me-heading" class="text-4xl font-extrabold text-primary-blue text-center mb-8">
        Sobre Mim
      </h1>

      <!-- Profile Image -->
      <div class="flex justify-center mb-8">
        <picture>
          <source srcset="/assets/NatiAboutMe.webp" type="image/webp">
          <source srcset="/assets/NatiAboutMe.png" type="image/png">
          <img src="/assets/NatiAboutMe.webp" alt="Foto de Natalia Ferreira, Psicóloga Clínica e Orientadora de Carreira" class="w-64 h-64 rounded-full object-cover shadow-lg" width="256" height="256" loading="lazy">
        </picture>
      </div>

      <!-- Main Content -->
      <div class="bg-primary-pink bg-opacity-20 rounded-lg shadow-xl p-8">
        <h2 class="sr-only">Biografia de Natalia Ferreira</h2>
        <p class="text-lg text-gray-800 leading-relaxed mb-6">
          Olá! Sou Natalia Ferreira, Psicóloga Clínica e Orientadora de Carreira graduada pela Universidade Federal de Santa Catarina (UFSC). Com formação em Terapia Relacional Sistêmica e experiência em ambientes hospitalares, organizacionais além da clínica, ofereço uma abordagem que considera seu contexto de vida e de relações como um todo.        </p>
        <p class="text-lg text-gray-800 leading-relaxed mb-6">
          Meu compromisso é criar um espaço terapêutico verdadeiramente inclusivo, fundamentado em estudos contínuos sobre questões sociais, raciais, de gênero e sexualidade, para além de cuidar do seu sofrimento ou dificuldades. Trago uma perspectiva intercultural para nossa jornada conjunta.        </p>
        <p class="text-lg text-gray-800 leading-relaxed mb-6">
          Apaixonada por artes e novas culturas, busco compreender a diversidade humana em toda sua riqueza. Se você procura clareza, apoio ou transformação, estou aqui para oferecer um ambiente seguro e livre de julgamentos.        </p>
        <p class="text-lg text-gray-800 leading-relaxed mb-6">
          Vamos trabalhar juntos pelo seu bem-estar e crescimento pessoal. Sinta-se à vontade para agendar uma consulta e iniciar sua jornada de autoconhecimento.        </p>
        <p class="text-lg text-gray-800 leading-relaxed mt-6 font-semibold">
          Com afeto,<br>
          Natalia Ferreira<br>
          <span itemprop="credentials">CRP 12/19892</span>
        </p>
      </div>

      <!-- Call-to-Action Button -->
      <div class="text-center mt-8">
        <a
            :href="whatsappLink"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center bg-primary-blue text-2xl text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-opacity-90 transition duration-300 transform hover:scale-105 mt-6"
            aria-label="Agende sua sessão via WhatsApp">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              fill="currentColor"
              class="w-8 h-8 mr-2"
              aria-hidden="true">
            <path fill="#fff" d="M4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24 c0,10.5-8.5,19-19,19c0,0,0,0,0,0h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3z"></path>
            <path fill="#fff" d="M4.9,43.8c-0.1,0-0.3-0.1-0.4-0.1c-0.1-0.1-0.2-0.3-0.1-0.5L7,33.5c-1.6-2.9-2.5-6.2-2.5-9.6  C4.5,13.2,13.3,4.5,24,4.5c5.2,0,10.1,2,13.8,5.7c3.7,3.7,5.7,8.6,5.7,13.8c0,10.7-8.7,19.5-19.5,19.5c-3.2,0-6.3-0.8-9.1-2.3  L5,43.8C5,43.8,4.9,43.8,4.9,43.8z"></path>
            <path fill="#cfd8dc" d="M24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3  l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5 M24,43L24,43L24,43 M24,43L24,43L24,43 M24,4L24,4C13,4,4,13,4,24 c0,3.4,0.8,6.7,2.5,9.6L3.9,43c-0.1,0.3,0,0.7,0.3,1c0.2,0.2,0.4,0.3,0.7,0.3c0.1,0,0.2,0,0.3,0l9.7-2.5c2.8,1.5,6,2.2,9.2,2.2 c11,0,20-9,20-20c0-5.3-2.1-10.4-5.8-14.1C34.4,6.1,29.4,4,24,4L24,4z"></path>
            <path fill="#40c351" d="M35.2,12.8c-3-3-6.9-4.6-11.2-4.6C15.3,8.2,8.2,15.3,8.2,24c0,3,0.8,5.9,2.4,8.4L11,33l-1.6,5.8l6-1.6l0.6,0.3  c2.4,1.4,5.2,2.2,8,2.2h0c8.7,0,15.8-7.1,15.8-15.8C39.8,19.8,38.2,15.8,35.2,12.8z"></path>
            <path fill="#fff" fill-rule="evenodd" d="M19.3,16c-0.4-0.8-0.7-0.8-1.1-0.8c-0.3,0-0.6,0-0.9,0s-0.8,0.1-1.3,0.6c-0.4,0.5-1.7,1.6-1.7,4 s1.7,4.6,1.9,4.9s3.3,5.3,8.1,7.2c4,1.6,4.8,1.3,5.7,1.2c0.9-0.1,2.8-1.1,3.2-2.3c0.4-1.1,0.4-2.1,0.3-2.3c-0.1-0.2-0.4-0.3-0.9-0.6  s-2.8-1.4-3.2-1.5c-0.4-0.2-0.8-0.2-1.1,0.2c-0.3,0.5-1.2,1.5-1.5,1.9c-0.3,0.3-0.6,0.4-1,0.1c-0.5-0.2-2-0.7-3.8-2.4  c-1.4-1.3-2.4-2.8-2.6-3.3c-0.3-0.5,0-0.7,0.2-1c0.2-0.2,0.5-0.6,0.7-0.8c0.2-0.3,0.3-0.5,0.5-0.8c0.2-0.3,0.1-0.6,0-0.8 C20.6,19.3,19.7,17,19.3,16z" clip-rule="evenodd"></path>
          </svg>
          Agende Sua Sessão
        </a>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'AboutMeSection',
  data() {
    return {
      phoneNumber: '+554884323764',
      message: '',
    }
  },
  computed: {
    whatsappLink() {
      return `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(this.message)}`;
    },
  },
  metaInfo() {
    return {
      title: 'Sobre Natalia Ferreira - Psicóloga Clínica e Orientadora de Carreira',
      meta: [
        { name: 'description', content: 'Conheça Natalia Ferreira, Psicóloga Clínica e Orientadora de Carreira. Especializada em Terapia Relacional Sistêmica, oferecendo atendimento inclusivo e personalizado.' },
        { property: 'og:title', content: 'Sobre Natalia Ferreira - Psicóloga Clínica e Orientadora de Carreira' },
        { property: 'og:description', content: 'Conheça Natalia Ferreira, Psicóloga Clínica e Orientadora de Carreira. Especializada em Terapia Relacional Sistêmica, oferecendo atendimento inclusivo e personalizado.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: '/assets/NatiAboutMe.webp' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Sobre Natalia Ferreira - Psicóloga Clínica e Orientadora de Carreira' },
        { name: 'twitter:description', content: 'Conheça Natalia Ferreira, Psicóloga Clínica e Orientadora de Carreira. Especializada em Terapia Relacional Sistêmica, oferecendo atendimento inclusivo e personalizado.' },
        { name: 'twitter:image', content: '/assets/NatiAboutMe.webp' },
      ],
    }
  },
};
</script>

<style scoped>
/* Add any additional styles if necessary */
</style>