<template>
  <section class="bg-gradient-to-br from-primary-blue to-primary-pink py-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-4xl font-extrabold text-primary-blue text-center mb-8">
        Sobre Mim
      </h2>

      <!-- Profile Image -->
      <div class="flex justify-center mb-8">
        <img src="@/assets/img_1.png" alt="Natalia Ferreira" class="w-48 h-48 rounded-full object-cover shadow-lg">
      </div>

      <!-- Main Content -->
      <div class="bg-white bg-opacity-75 rounded-lg shadow-xl p-8">
        <p class="text-lg text-gray-800 leading-relaxed mb-6">
          Olá! Sou Natalia Ferreira, Psicóloga Clínica e Orientadora de Carreira, formada pela Universidade Federal de Santa Catarina (UFSC). Minha jornada profissional é enriquecida pela formação em Terapia Relacional Sistêmica e por 8 anos de experiência em Psicologia Organizacional.
        </p>
        <p class="text-lg text-gray-800 leading-relaxed mb-6">
          Acredito no poder transformador da escuta atenta e do diálogo aberto. Minha abordagem sistêmica me permite uma compreensão mais ampla do seu contexto de vida, considerando suas relações e o ambiente em que está inserido.
        </p>
        <p class="text-lg text-gray-800 leading-relaxed mb-6">
          Para além da técnica, me dedico ao estudo contínuo de temáticas sociais, raciais, de gênero, sexualidade e questões relacionadas à vida imigrante. Meu objetivo é proporcionar um ambiente terapêutico verdadeiramente inclusivo e acolhedor, trazendo uma perspectiva intercultural e interracial.
        </p>
        <p class="text-lg text-gray-800 leading-relaxed mb-6">
          Além da psicologia, sou apaixonada por artes, especialmente pintura, e adoro explorar novas culturas através de viagens e gastronomia. Essas experiências enriquecem minha perspectiva e me ajudam a compreender melhor a diversidade humana, refletindo diretamente na minha prática clínica.        </p>
        <p class="text-lg text-gray-800 leading-relaxed mb-6">
          Se você busca clareza, apoio ou transformação em algum aspecto da sua vida, estou aqui para oferecer um espaço seguro, confidencial e livre de julgamentos. Juntos, podemos trabalhar para alcançar seus objetivos e promover seu bem-estar integral.
        </p>
        <p class="text-lg text-gray-800 leading-relaxed mb-6">
          Será uma honra te acompanhar nessa jornada de autoconhecimento e crescimento pessoal. Sinta-se à vontade para entrar em contato e agendar uma consulta.
        </p>
        <p class="text-lg text-gray-800 leading-relaxed mt-6 font-semibold">
          Com carinho e dedicação,<br>
          Natalia Ferreira<br>
          CRP 12/19892
        </p>
      </div>

      <!-- Call-to-Action Button -->
      <div class="text-center mt-8">
        <a
            :href="whatsappLink"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center bg-primary-pink-dark text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-opacity-90 transition duration-300 transform hover:scale-105 mt-6">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="5 0 48 48"
              fill="currentColor"
              class="w-5 h-5 mr-2">
            <path fill="#fff" d="M4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24 c0,10.5-8.5,19-19,19c0,0,0,0,0,0h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3z"></path>
            <path fill="#fff" d="M4.9,43.8c-0.1,0-0.3-0.1-0.4-0.1c-0.1-0.1-0.2-0.3-0.1-0.5L7,33.5c-1.6-2.9-2.5-6.2-2.5-9.6  C4.5,13.2,13.3,4.5,24,4.5c5.2,0,10.1,2,13.8,5.7c3.7,3.7,5.7,8.6,5.7,13.8c0,10.7-8.7,19.5-19.5,19.5c-3.2,0-6.3-0.8-9.1-2.3  L5,43.8C5,43.8,4.9,43.8,4.9,43.8z"></path>
            <path fill="#cfd8dc" d="M24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3  l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5 M24,43L24,43L24,43 M24,43L24,43L24,43 M24,4L24,4C13,4,4,13,4,24 c0,3.4,0.8,6.7,2.5,9.6L3.9,43c-0.1,0.3,0,0.7,0.3,1c0.2,0.2,0.4,0.3,0.7,0.3c0.1,0,0.2,0,0.3,0l9.7-2.5c2.8,1.5,6,2.2,9.2,2.2 c11,0,20-9,20-20c0-5.3-2.1-10.4-5.8-14.1C34.4,6.1,29.4,4,24,4L24,4z"></path>
            <path fill="#40c351" d="M35.2,12.8c-3-3-6.9-4.6-11.2-4.6C15.3,8.2,8.2,15.3,8.2,24c0,3,0.8,5.9,2.4,8.4L11,33l-1.6,5.8l6-1.6l0.6,0.3  c2.4,1.4,5.2,2.2,8,2.2h0c8.7,0,15.8-7.1,15.8-15.8C39.8,19.8,38.2,15.8,35.2,12.8z"></path>
            <path fill="#fff" fill-rule="evenodd" d="M19.3,16c-0.4-0.8-0.7-0.8-1.1-0.8c-0.3,0-0.6,0-0.9,0s-0.8,0.1-1.3,0.6c-0.4,0.5-1.7,1.6-1.7,4 s1.7,4.6,1.9,4.9s3.3,5.3,8.1,7.2c4,1.6,4.8,1.3,5.7,1.2c0.9-0.1,2.8-1.1,3.2-2.3c0.4-1.1,0.4-2.1,0.3-2.3c-0.1-0.2-0.4-0.3-0.9-0.6  s-2.8-1.4-3.2-1.5c-0.4-0.2-0.8-0.2-1.1,0.2c-0.3,0.5-1.2,1.5-1.5,1.9c-0.3,0.3-0.6,0.4-1,0.1c-0.5-0.2-2-0.7-3.8-2.4  c-1.4-1.3-2.4-2.8-2.6-3.3c-0.3-0.5,0-0.7,0.2-1c0.2-0.2,0.5-0.6,0.7-0.8c0.2-0.3,0.3-0.5,0.5-0.8c0.2-0.3,0.1-0.6,0-0.8 C20.6,19.3,19.7,17,19.3,16z" clip-rule="evenodd"></path>
          </svg>
          Entrar em Contato
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
};
</script>

<style scoped>
/* Add any additional styles if necessary */
</style>
