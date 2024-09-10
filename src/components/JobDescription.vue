<template>
  <section :id="id" class="bg-white text-primary-blue py-8 sm:py-12 lg:py-16">
    <!-- About Me and My Work -->
    <div class="container mx-auto flex flex-col lg:flex-row items-center mb-12 lg:mb-16">
      <div class="w-full lg:w-1/3 mb-8 lg:mb-0 px-4 lg:px-0">
        <img src="../assets/meelo.png" alt="About Me" class="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-lg shadow-lg" loading="lazy"/>
      </div>
      <div class="relative w-full lg:w-2/3 lg:pl-12 mt-4 lg:mt-0 px-4 lg:px-0">
        <div
            class="absolute inset-0 bg-gradient-to-r from-primary-pink to-white shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div class="relative px-6 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16 bg-white shadow-lg sm:rounded-3xl">
          <div class="max-w-lg mx-auto">
            <div class="divide-y divide-gray-200">
              <div class="py-6 sm:py-8 lg:py-10 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 class="text-2xl sm:text-3xl font-bold mb-4 font-serif">About Me and My Work</h2>
                <p class="text-base sm:text-lg font-sans">
                  As a dedicated psychologist, I bring a wealth of experience and a passion for helping individuals
                  navigate life's challenges. My approach is rooted in evidence-based practices, combining traditional
                  therapeutic methods with innovative techniques to provide personalized care that addresses each
                  client's unique needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Explaining the Therapy Type -->
    <div class="container mx-auto flex flex-col lg:flex-row-reverse items-center mb-12 lg:mb-16">
      <div class="w-full lg:w-1/3 mb-8 lg:mb-0 px-4 lg:px-0">
        <img src="../assets/meelo.png" alt="Therapy Type" class="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-lg shadow-lg loading="lazy""/>
      </div>
      <div class="relative w-full lg:w-2/3 lg:pr-12 mt-4 lg:mt-0 px-4 lg:px-0">
        <div
            class="absolute inset-0 bg-gradient-to-l from-primary-pink to-white shadow-lg transform -skew-y-6 sm:skew-y-0 sm:rotate-6 sm:rounded-3xl"></div>
        <div class="relative px-6 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16 bg-white shadow-lg sm:rounded-3xl">
          <div class="max-w-lg mx-auto">
            <div class="divide-y divide-gray-200">
              <div class="py-6 sm:py-8 lg:py-10 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 class="text-2xl sm:text-3xl font-bold mb-4 font-serif">My Therapeutic Approach</h2>
                <p class="text-base sm:text-lg font-sans">
                  I specialize in cognitive-behavioral therapy (CBT), which focuses on identifying and changing negative
                  thought patterns and behaviors. This approach is highly effective for treating a wide range of issues,
                  including anxiety, depression, and stress management. Additionally, I incorporate mindfulness
                  techniques to enhance self-awareness and emotional regulation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- How I Work -->
    <div class="container mx-auto flex flex-col lg:flex-row items-center mb-12 lg:mb-16">
      <div class="w-full lg:w-1/3 mb-8 lg:mb-0 px-4 lg:px-0">
        <img src="../assets/meelo.png" alt="How I Work" class="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-lg shadow-lgloading="lazy""/>
      </div>
      <div class="relative w-full lg:w-2/3 lg:pl-12 mt-4 lg:mt-0 px-4 lg:px-0">
        <div
            class="absolute inset-0 bg-gradient-to-r from-primary-pink to-white shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div class="relative px-6 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16 bg-white shadow-lg sm:rounded-3xl">
          <div class="max-w-lg mx-auto">
            <div class="divide-y divide-gray-200">
              <div class="py-6 sm:py-8 lg:py-10 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 class="text-2xl sm:text-3xl font-bold mb-4 font-serif">How I Work</h2>
                <p class="text-base sm:text-lg font-sans">
                  My process begins with a comprehensive assessment to understand your unique situation and goals. From there,
                  we collaborate to develop a tailored treatment plan. Sessions are conducted in a safe, non-judgmental
                  environment where you can explore your thoughts and feelings freely. I emphasize practical strategies and
                  tools that you can apply in your daily life, empowering you to make lasting positive changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'JobDescriptionComponent',
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