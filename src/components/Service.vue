<template>
  <section :id="id" class="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-primary-pink bg-opacity-20">
    <div class="container mx-auto">
      <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-blue mb-6 sm:mb-8 text-center relative">
        In-Person and Online Sessions Available
        <span class="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-4/5 sm:w-3/5 h-0.5 bg-primary-pink"></span>
      </h2>
      <div class="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
        <p class="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
          For our first encounter, I like to offer an initial consultation to address any questions you may have. This option is not mandatory; it's entirely up to the patient to choose between starting the therapy process right away or requesting this preliminary interview.
        </p>
        <div class="mt-6 sm:mt-8 flex justify-center">
          <button class="bg-primary-blue text-white font-semibold py-2 px-4 sm:px-6 rounded-full hover:bg-opacity-90 transition duration-300 transform hover:scale-105 text-sm sm:text-base">
            Schedule Your Session
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ServicesInfo',
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
</style>