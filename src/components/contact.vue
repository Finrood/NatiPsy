<template>
  <section :id="id" class="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white">
    <div class="container mx-auto">
      <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-blue mb-6 sm:mb-8 text-center relative">
        Contact
        <span class="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-4/5 sm:w-3/5 h-0.5 bg-primary-pink"></span>
      </h2>
      <div class="bg-primary-pink bg-opacity-20 p-6 sm:p-8 rounded-lg shadow-lg">
        <div class="grid sm:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <p class="text-base sm:text-lg text-gray-700 leading-relaxed mb-4">
              Office located next to Sírio Libanês Hospital, just minutes away from Paulista and 9 de Julho avenues. Perfect for those near the green and yellow metro lines.
            </p>
            <p class="text-base sm:text-lg text-gray-700 font-semibold mb-1 sm:mb-2">
              Address:
            </p>
            <p class="text-base sm:text-lg text-gray-700 mb-4">
              Rua Barata Ribeiro, 490, suite 104
            </p>
            <p class="text-base sm:text-lg text-gray-700 font-semibold mb-1 sm:mb-2">
              Phone:
            </p>
            <p class="text-base sm:text-lg text-gray-700 mb-4">
              (11) 96705-3332
            </p>
          </div>
          <div class="flex flex-col justify-center">
            <p class="text-base sm:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
              To clarify any doubts, obtain information, or schedule your session, please get in touch.
            </p>
            <a
                href="https://wa.me/5511967053332"
                target="_blank"
                rel="noopener noreferrer"
                class="bg-primary-blue text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-full hover:bg-opacity-90 transition duration-300 transform hover:scale-105 text-center text-sm sm:text-base"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ContactInfo',
  props: {
    id: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700&display=swap');

section {
  font-family: 'Raleway', sans-serif;
}
</style>